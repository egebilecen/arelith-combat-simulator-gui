use crate::db;
use arelith::{
    character::{AbilityList, Character},
    dice::Dice,
    feat::feat_db::get_feat,
    item::{
        weapon_db::{get_weapon_base, get_weapon_base_list},
        Damage, DamageType, ItemProperty, Weapon, WeaponBase,
    },
    simulator::{CombatSimulator, DamageTestResult},
    size::SizeCategory,
};
use serde::Serialize;
use serde_json::Value;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    thread,
};
use tauri::Manager;

#[derive(Clone, Serialize)]
struct SimulationUpdatePayload<'a> {
    status: &'a str,
    details: Option<serde_json::Value>,
}

impl<'a> SimulationUpdatePayload<'a> {
    pub fn new(status: &'a str, details: Option<serde_json::Value>) -> Self {
        Self { status, details }
    }
}

#[derive(Clone, Serialize)]
struct SimulationCharacterUpdatePayload {}

#[tauri::command(async)]
pub fn is_debug() -> bool {
    #[cfg(debug_assertions)]
    return true;

    #[cfg(not(debug_assertions))]
    return false;
}

#[tauri::command(async)]
pub fn get_row_by_id(table: &str, id: i32) -> db::QueryResult<db::RowData> {
    db::get_row_by_id(table, id)
}

#[tauri::command(async)]
pub fn get_rows(table: &str) -> db::QueryResult<Vec<db::RowData>> {
    db::get_rows(&table)
}

#[tauri::command(async)]
pub fn insert_row(table: &str, name: &str, json: &str) -> db::QueryResult<i64> {
    db::insert_row(table, name, json)
}

#[tauri::command(async)]
pub fn delete_row(table: &str, id: i32) -> db::QueryResult<usize> {
    db::delete_row(table, id)
}

#[tauri::command(async)]
pub fn delete_all_rows(table: &str) -> db::QueryResult<usize> {
    db::delete_all_rows(table)
}

#[tauri::command(async)]
pub fn get_base_weapons() -> HashMap<String, WeaponBase> {
    get_weapon_base_list()
}

#[tauri::command(async)]
pub fn create_character(
    name: &str,
    size: &str,
    ab: i32,
    strength: i32,
    base_apr: i32,
    extra_apr: i32,
    weapon: Weapon,
    features: Vec<&str>,
) -> Character {
    fn to_size(size: &str) -> SizeCategory {
        match size.to_lowercase().as_str() {
            "tiny" => SizeCategory::Tiny,
            "small" => SizeCategory::Small,
            "medium" => SizeCategory::Medium,
            "large" => SizeCategory::Large,
            "huge" => SizeCategory::Huge,
            _ => SizeCategory::Medium,
        }
    }

    let mut builder = Character::builder()
        .name(name.to_string())
        .size(to_size(size))
        .abilities(AbilityList::builder().str(strength).build())
        .ab(ab)
        .base_apr(base_apr)
        .extra_apr(extra_apr)
        .weapon(weapon);

    for feature in features {
        builder = builder.add_feat(get_feat(feature));
    }

    builder.build()
}

#[tauri::command(async)]
pub fn create_weapon(
    name: &str,
    base_weapon: &str,
    threat_range: i32,
    crit_mult: i32,
    item_props: Vec<Value>,
) -> Weapon {
    fn to_damage_type(dmg_type: &str) -> DamageType {
        match dmg_type.to_lowercase().as_str() {
            "slashing" => DamageType::Slashing,
            "piercing" => DamageType::Piercing,
            "bludgeoning" => DamageType::Bludgeoning,
            "magical" => DamageType::Magical,
            "acid" => DamageType::Acid,
            "cold" => DamageType::Cold,
            "divine" => DamageType::Divine,
            "electrical" => DamageType::Electrical,
            "fire" => DamageType::Fire,
            "negative" => DamageType::Negative,
            "positive" => DamageType::Positive,
            "sonic" => DamageType::Sonic,
            "entropy" => DamageType::Entropy,
            "force" => DamageType::Force,
            "psychic" => DamageType::Psychic,
            "poison" => DamageType::Poison,
            _ => DamageType::Slashing,
        }
    }

    let mut iprops = vec![
        ItemProperty::ThreatRangeOverride(threat_range),
        ItemProperty::CriticalMultiplierOverride(crit_mult),
    ];

    for obj in item_props.iter() {
        let type_ = obj["type"].as_str().unwrap();

        match type_ {
            "Damage Bonus" => {
                let val = obj["value"].as_str().unwrap();
                let dmg_type = obj["extra"].as_str().unwrap();
                let dmg_props: Vec<&str> = obj["dmg_props"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .map(|e| e.as_str().unwrap())
                    .collect();

                let can_crit = dmg_props.contains(&"can_crit");
                let is_resistable = dmg_props.contains(&"resistable");

                iprops.push(ItemProperty::DamageBonus(Damage::new(
                    to_damage_type(dmg_type),
                    if val.contains("d") {
                        Dice::from(val)
                    } else {
                        Dice::from(val.parse::<i32>().unwrap())
                    },
                    is_resistable,
                    can_crit,
                )));
            }
            "Massive Critical" => {
                let val = obj["value"].as_str().unwrap();

                iprops.push(ItemProperty::MassiveCrit(if val.contains("d") {
                    Dice::from(val)
                } else {
                    Dice::from(val.parse::<i32>().unwrap())
                }));
            }
            _ => (),
        }
    }

    Weapon::new(name.to_string(), get_weapon_base(base_weapon), iprops)
}

#[tauri::command(async)]
pub fn start_simulation(
    app: tauri::AppHandle,
    total_rounds: i32,
    characters: HashMap<i32, Character>,
    dummy_ac_list: Vec<i32>,
    dummy_concealment: i32,
    dummy_has_epic_dodge: bool,
    dummy_damage_immunity: i32,
    dummy_defensive_essence: i32,
) {
    let combat_simulator = CombatSimulator::new(total_rounds);

    let cb_app = app.clone();
    let callback_fn = move |_: &_, _: &_, _: &_| {
        let _ = cb_app.emit_all(
            "simulation_update",
            SimulationUpdatePayload::new("working", None),
        );
    };

    combat_simulator.set_damage_test_notifier(&callback_fn);

    let mut simulation_results: HashMap<i32, DamageTestResult> = HashMap::new();

    for (id, character) in characters.iter() {
        let ac_list = dummy_ac_list.clone();

        let result = combat_simulator.damage_test(
            &character,
            ac_list,
            dummy_concealment,
            dummy_damage_immunity,
            dummy_defensive_essence,
            dummy_has_epic_dodge,
        );

        simulation_results.insert(*id, result);

        let _ = app.emit_all(
            "simulation_update",
            SimulationUpdatePayload::new(
                "character_complete",
                Some(serde_json::to_value(character).unwrap()),
            ),
        );
    }

    let _ = app.emit_all(
        "simulation_update",
        SimulationUpdatePayload::new(
            "done",
            Some(serde_json::to_value(simulation_results).unwrap()),
        ),
    );
}

#[tauri::command(async)]
pub fn start_threaded_simulation(
    app: tauri::AppHandle,
    total_rounds: i32,
    mut characters: HashMap<i32, Character>,
    dummy_ac_list: Vec<i32>,
    dummy_concealment: i32,
    dummy_has_epic_dodge: bool,
    dummy_damage_immunity: i32,
    dummy_defensive_essence: i32,
) {
    let simulation_results: Arc<Mutex<HashMap<i32, DamageTestResult>>> =
        Arc::new(Mutex::new(HashMap::new()));
    let mut threads = vec![];

    let id_list: Vec<i32> = characters.keys().map(|e| e.to_owned()).collect();

    for id in id_list {
        let simulation_results = simulation_results.clone();

        let cb_app = Mutex::new(app.clone());
        let app = Mutex::new(app.clone());
        let total_rounds = Mutex::new(total_rounds);
        let character = Mutex::new(characters.remove(&id).unwrap());
        let dummy_ac_list = Mutex::new(dummy_ac_list.clone());
        let dummy_concealment = Mutex::new(dummy_concealment);
        let dummy_has_epic_dodge = Mutex::new(dummy_has_epic_dodge);
        let dummy_damage_immunity = Mutex::new(dummy_damage_immunity);
        let dummy_defensive_essence = Mutex::new(dummy_defensive_essence);

        let handle = thread::spawn(move || {
            let mut simulation_results = simulation_results.lock().unwrap();

            let app = app.lock().unwrap();
            let total_rounds = total_rounds.lock().unwrap();
            let character = character.lock().unwrap();
            let dummy_ac_list = dummy_ac_list.lock().unwrap();
            let dummy_concealment = dummy_concealment.lock().unwrap();
            let dummy_has_epic_dodge = dummy_has_epic_dodge.lock().unwrap();
            let dummy_damage_immunity = dummy_damage_immunity.lock().unwrap();
            let dummy_defensive_essence = dummy_defensive_essence.lock().unwrap();

            let combat_simulator = CombatSimulator::new(*total_rounds);

            let callback_fn = move |_: &_, _: &_, _: &_| {
                let cb_app = cb_app.lock().unwrap();

                let _ = (*cb_app).emit_all(
                    "simulation_update",
                    SimulationUpdatePayload::new("working", None),
                );
            };

            combat_simulator.set_damage_test_notifier(&callback_fn);

            let result = combat_simulator.damage_test(
                &*character,
                (*dummy_ac_list).clone(),
                *dummy_concealment,
                *dummy_damage_immunity,
                *dummy_defensive_essence,
                *dummy_has_epic_dodge,
            );

            (*simulation_results).insert(id, result);

            let _ = app.emit_all(
                "simulation_update",
                SimulationUpdatePayload::new(
                    "character_complete",
                    Some(serde_json::to_value(&*character).unwrap()),
                ),
            );
        });

        threads.push(handle);
    }

    for handle in threads {
        handle.join().unwrap();
    }

    let _ = app.emit_all(
        "simulation_update",
        SimulationUpdatePayload::new(
            "done",
            Some(serde_json::to_value((*simulation_results.lock().unwrap()).clone()).unwrap()),
        ),
    );
}

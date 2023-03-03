# Download required libraries by running commands below:
# pip install matplotlib

from random import randint
from math   import floor
from itertools import cycle
import unicodedata
import re
import os
import matplotlib.pyplot as plt

#####################################################################
# DEFINES
ROUNDS = 500000

CHARACTER_EXAMPLE = {
    "name"                  : "20 barb / 7 wm / 3 rog",

    "ab"                    : 48,
    "base_apr"              : 4,
    "dual_wielding"         : False,
    "extra_attack"          : 2, # haste, thundering rage etc.
    "str_mod"               : 14,
    "overwhelming_critical" : False,
    "is_monk"               : False, # If character is monk, AB penalty is set to -3 from -5 for consecutively attacks.

    "weapon"                : {
        "name"                : "M. Damask Rapier",
        "damage"              : "1d6",
        "damage_bonus"        : 6 + 6,
        "threat_range"        : 10,
        "crit_multiplier"     : 3,
        "other_damage_bonus"  : [
            {"name" : "Sonic", "damage" : "1d6", "resistable" : True, "no_crit" : False},
            {"name" : "Positive", "damage" : "1d6", "resistable" : True, "no_crit" : False},
        ],
        "massive_crit"        : None
    }
}

TARGET = {
    "ac_list"           : [40, 45, 50, 55, 60, 65, 70],
    "defensive_essence" : 5,  # if resistable is TRUE in other_damage_bonus elements, it will be reduced by this amount.
    "concealment"       : 50, # calculation will be done as assuming attacker has blind fight.
    "epic_dodge"        : False,
    "crit_immunity"     : False,
    "physical_immunity" : 10,
    "physical_damage_reduction": 0
}

PLOT_Y_LIST      = []
PLOT_LINES       = ["-","--","-.",":"]
PLOT_LINE_CYCLER = cycle(PLOT_LINES)
PLOT_IS_DRAWING  = False

RESULT_STR = ""
RESULT_OUTPUT_DIR = "./result/"

#####################################################################
# Helper Functions
def d(faces, rolls=1):
    if isinstance(faces, str):
        _rolls, _faces = parse_dice(faces)
        
        rolls *= _rolls
        faces  = _faces
    
    result = 0

    for _ in range(rolls):
        value = randint(1, faces)
        result += value

    return result

def parse_dice(dice="d6"):
    if isinstance(dice, int): return dice, 1

    split = dice.split("d")

    if split[0] == "":
        return 1, int(split[1])
    else:
        return int(split[0]), int(split[1])

def calculate_apr(character):
    apr = character["base_apr"]

    if character["dual_wielding"]: apr += 2
    apr += character["extra_attack"]

    return apr

def calculate_ab_from_attack_number(character, attack_number):
    ab_penalty = 5

    if character["is_monk"]: ab_penalty = 3

    if attack_number <= character["base_apr"]:
        return character["ab"] - (ab_penalty * (attack_number - 1)), "mainhand"
    else:
        if character["extra_attack"] > 0 \
        and attack_number <= character["base_apr"] + character["extra_attack"]:
            extra_atk_no = attack_number - character["base_apr"] - character["extra_attack"] + (character["extra_attack"] - 1)
            ret_ab       = character["ab"] - (extra_atk_no * ab_penalty)

            if character["dual_wielding"]: ret_ab += 2

            return ret_ab, "extra_attack"
        elif  character["dual_wielding"] \
        and attack_number <= calculate_apr(character):
            dw_atk_no = attack_number - calculate_apr(character) + 1
            return character["ab"] - (dw_atk_no * ab_penalty), "offhand"

    raise ValueError("error: cannot calculate ab from attack number, attack number: "+str(attack_number))

def get_weapon_damage(character, is_crit=False, is_offhand_attack=False):
    roll_amount = 1
    if is_crit: roll_amount = character["weapon"]["crit_multiplier"]

    weapon_dmg_bonus = character["weapon"]["damage_bonus"]

    if is_offhand_attack:
        weapon_dmg_bonus += int(character["str_mod"] / 2)
    else:
        weapon_dmg_bonus += character["str_mod"]

    ret_val = d(character["weapon"]["damage"], roll_amount) + (weapon_dmg_bonus * roll_amount)

    return ret_val

def get_weapon_other_damage(character, is_crit=False):
    ret_list = []

    for dmg_bonus in character["weapon"]["other_damage_bonus"]:
        roll_amount = 1
        if is_crit and dmg_bonus["no_crit"] != False: roll_amount = character["weapon"]["crit_multiplier"]
        
        other_dmg = dmg_bonus.copy()
        
        dmg = d(str(dmg_bonus["damage"])+"d1" if isinstance(dmg_bonus["damage"], int) else dmg_bonus["damage"], roll_amount)

        other_dmg["damage"] = dmg
        ret_list.append(other_dmg)

    return ret_list

def calculate_percentage(val, max_val):
    return (100 * val) / max_val

def apply_blind_fight(concealment):
    return (concealment ** 2) / 100

def print_f(title="", text=""):
    global RESULT_STR

    if title == "" and text == "":
        RESULT_STR += "\n"
        # print()
        return

    title_width = 35
    title_adjusted = title.ljust(title_width)

    RESULT_STR += title_adjusted + text + "\n"

    # print(title_adjusted, end="")
    # print(text, end="")
    # print()

def slugify(value, allow_unicode=False):
    """
        Taken from https://github.com/django/django/blob/master/django/utils/text.py
        Convert to ASCII if 'allow_unicode' is False. Convert spaces or repeated
        dashes to single dashes. Remove characters that aren't alphanumerics,
        underscores, or hyphens. Convert to lowercase. Also strip leading and
        trailing whitespace, dashes, and underscores.
    """
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')

def simulate(character):
    global TARGET

    dummy_result = {
        "name"             : character["name"],
        "total_attack"     : 0,
        "total_hit"        : 0,
        "total_miss"       : 0,
        "total_concealed"  : 0,
        "total_epic_dodge" : 0,
        "total_crit"       : 0,
        "total_damage"     : 0,
        "total_weapon_damage" : 0,
        "total_bonus_damage"  : {}
    }
    result_list = {}

    for _ in range(ROUNDS):
        epic_dodge_list = {}
        
        for target_ac in TARGET["ac_list"]:
            epic_dodge_list[target_ac] = True
        
        for i in range(calculate_apr(character)):
            for target_ac in TARGET["ac_list"]:
                if target_ac not in result_list:
                    result_list[target_ac] = dummy_result.copy()
                    result_list[target_ac]["total_bonus_damage"] = {}

                character_ab, attack_type = calculate_ab_from_attack_number(character, i + 1)
                result_list[target_ac]["total_attack"] += 1

                is_hit   = False
                hit_roll = d(20)

                if  TARGET["concealment"] > 0 \
                and randint(1, 100) < apply_blind_fight(TARGET["concealment"]):
                    # Target concealed
                    result_list[target_ac]["total_concealed"] += 1
                elif (character_ab + hit_roll >= target_ac or hit_roll == 20) \
                and hit_roll != 1:
                    is_hit = True
                    
                    if TARGET["epic_dodge"] \
                    and epic_dodge_list[target_ac]:
                        # Epic Dodged
                        is_hit = False
                        epic_dodge_list[target_ac] = False
                        result_list[target_ac]["total_epic_dodge"] += 1

                weapon_damage = 0
                other_damage  = []

                if is_hit:
                    is_critical = False

                    # check if critical
                    if not TARGET["crit_immunity"] \
                    and hit_roll >= character["weapon"]["threat_range"] \
                    and character_ab + d(20) >= target_ac: # confirmation roll
                        is_critical = True
                        result_list[target_ac]["total_crit"] += 1

                    weapon_damage = get_weapon_damage(character, is_critical, True if attack_type == "offhand" else False)
                    other_damage  = get_weapon_other_damage(character, is_critical)
                    
                    if is_critical:
                        if character["weapon"]["massive_crit"] is not None:
                            weapon_damage += d(str(character["weapon"]["massive_crit"])+"d1" if isinstance(character["weapon"]["massive_crit"], int) else character["weapon"]["massive_crit"])

                        if character["overwhelming_critical"]:
                            weapon_damage += d(6, character["weapon"]["crit_multiplier"])

                    if TARGET["physical_immunity"] > 0:
                        weapon_damage -= floor(weapon_damage * TARGET["physical_immunity"] / 100)
                        
                    if TARGET["physical_damage_reduction"] > 0:
                        weapon_damage -= TARGET["physical_damage_reduction"]
                        
                    if weapon_damage < 0: weapon_damage = 0

                    result_list[target_ac]["total_damage"] += weapon_damage
                    result_list[target_ac]["total_weapon_damage"] += weapon_damage

                    for dmg in other_damage:
                        if dmg["name"] not in result_list[target_ac]["total_bonus_damage"]:
                            result_list[target_ac]["total_bonus_damage"][dmg["name"]] = 0

                        adjusted_dmg = dmg["damage"]
                        
                        if TARGET["defensive_essence"] and dmg["resistable"]:
                            adjusted_dmg -= TARGET["defensive_essence"]

                        if adjusted_dmg < 0: adjusted_dmg = 0
                        else:
                            result_list[target_ac]["total_bonus_damage"][dmg["name"]] += adjusted_dmg
                            result_list[target_ac]["total_damage"] += adjusted_dmg
                    
                    result_list[target_ac]["total_hit"] += 1
                        
                else: # miss
                    result_list[target_ac]["total_miss"] += 1
                    
    result  = sorted([(target_ac, result_list[target_ac]) for target_ac in result_list])
    ret_val = character, result
    save_result_details(ret_val)

    return ret_val

def draw_plot(result):
    global PLOT_IS_DRAWING
    global PLOT_Y_LIST
    
    character = result[0]

    x = []
    y = []

    for target_ac, sim_result in result[1]:
        avg_damage = sim_result["total_damage"] / ROUNDS

        x.append(target_ac)
        y.append(avg_damage)

    PLOT_Y_LIST.append(y)

    plt.plot(x, y, linestyle=next(PLOT_LINE_CYCLER), marker = "o", markersize=5, label = character["name"])
    plt.legend()
    plt.yticks(y)
    
    if not PLOT_IS_DRAWING:
        plt.grid()

        plt.xlabel("Target AC")
        plt.ylabel("Avarage Damage Per Round")

        PLOT_IS_DRAWING = True

    # for a, b in zip(x, y):
    #     plt.text(a, b, str("{0:.2f}".format(b)))

def draw_single_result_plot(result):
    global PLOT_IS_DRAWING
    character = result[0]

    draw_plot(result)

    plt.savefig(RESULT_OUTPUT_DIR+slugify(character["name"])+".png")
    plt.close()

    PLOT_IS_DRAWING = False

def draw_multiple_result_plot(result_list):
    global PLOT_IS_DRAWING
    global PLOT_Y_LIST

    for result in result_list:
        draw_plot(result)

    plt.savefig(RESULT_OUTPUT_DIR+"result.png")
    plt.close()

    arr_max_dmg = []

    for arr in PLOT_Y_LIST:
        if sum(arr) > sum(arr_max_dmg):
            arr_max_dmg = arr

    plt.yticks(arr_max_dmg)

    PLOT_IS_DRAWING = False

def save_result_details(result):
    global RESULT_STR
    character = result[0]

    print_f(character["name"])
    print_f()
    print_f("ROUNDS", str(ROUNDS))
    print_f()
    print_f("WEAPON NAME", character["weapon"]["name"])
    print_f("WEAPON DAMAGE", str(character["weapon"]["damage"]))
    print_f("WEAPON DAMAGE BONUS", str(character["weapon"]["damage_bonus"]))
    print_f("WEAPON THREAT RANGE", str(character["weapon"]["threat_range"]))
    print_f("WEAPON CRITICAL HIT MULTIPLIER", str(character["weapon"]["crit_multiplier"]))
    print_f("WEAPON OTHER DAMAGE BONUSES", "")
    for dmg_bonus in character["weapon"]["other_damage_bonus"]:
        print_f("    * "+dmg_bonus["name"].upper(), str(dmg_bonus["damage"]) + (" (CAN'T CRIT)" if dmg_bonus["no_crit"] else ""))
    print_f("WEAPON MASSIVE CRITICAL", "No" if character["weapon"]["massive_crit"] is None else str(character["weapon"]["massive_crit"]))
    print_f()
    print_f("CHARACTER AB", str(character["ab"]))
    print_f("CHARACTER TOTAL APR", str(calculate_apr(character)))
    print_f("CHARACTER STR MOD", str(character["str_mod"]))
    print_f("CHARACTER IS MONK", str("Yes" if character["is_monk"] else "No"))
    print_f("CHARACTER OVERWHELMING CRITICAL", str("Yes" if character["overwhelming_critical"] else "No"))
    print_f()
    print_f("TARGET DEFENSIVE ESSENCE", str(TARGET["defensive_essence"]))
    print_f("TARGET CONCEALMENT", str(TARGET["concealment"])+"% ({0:.2f}% w/ blind fight)".format(apply_blind_fight(TARGET["concealment"])))
    print_f("TARGET EPIC DODGE", str("Yes" if TARGET["epic_dodge"] else "No"))
    print_f("TARGET CRITICAL IMMUNITY", str("Yes" if TARGET["crit_immunity"] else "No"))
    print_f("TARGET PHYSICAL IMMUNITY", str(TARGET["physical_immunity"])+"%")
    print_f("TARGET PHYSICAL DAMAGE REDUCTION", str(TARGET["physical_damage_reduction"]))

    print_f("\n-=[RESULTS]=-")

    for target_ac, sim_result in result[1]:
        print_f()
        print_f("TARGET AC", str(target_ac))
        print_f("TOTAL ATTACK", str(sim_result["total_attack"]))
        print_f("TOTAL HIT", str(sim_result["total_hit"])+" ({0:.2f}% of total attacks)".format(calculate_percentage(sim_result["total_hit"], sim_result["total_attack"])))
        print_f("TOTAL MISS", str(sim_result["total_miss"])+" ({0:.2f}% of total attacks)".format(calculate_percentage(sim_result["total_miss"], sim_result["total_attack"])))
        print_f("    * CONCEALED ATTACKS", str(sim_result["total_concealed"])+" ({0:.2f}% of total misses)".format(calculate_percentage(sim_result["total_concealed"], sim_result["total_miss"])))
        print_f("    * EPIC DODGE", str(sim_result["total_epic_dodge"])+" ({0:.2f}% of total misses)".format(calculate_percentage(sim_result["total_epic_dodge"], sim_result["total_miss"])))
        print_f("TOTAL CRITICAL HIT", str(sim_result["total_crit"])+" ({0:.2f}% of total hits)".format(calculate_percentage(sim_result["total_crit"], sim_result["total_hit"])))
        print_f()
        print_f("TOTAL DAMAGE", str(sim_result["total_damage"]))
        print_f("TOTAL WEAPON DAMAGE", str(sim_result["total_weapon_damage"])+" ({0:.2f}% of total damage)".format(calculate_percentage(sim_result["total_weapon_damage"], sim_result["total_damage"])))
        print_f("TOTAL OTHER DAMAGE", str(sim_result["total_damage"] - sim_result["total_weapon_damage"])+" ({0:.2f}% of total damage)".format(calculate_percentage(sim_result["total_damage"] - sim_result["total_weapon_damage"], sim_result["total_damage"])))
        for name in sim_result["total_bonus_damage"].keys():
            dmg = sim_result["total_bonus_damage"][name]
            print_f("    * "+name.upper(), str(dmg))
        print_f()
        print_f("AVARAGE DAMAGE PER ROUND", "{0:.2f}".format(sim_result["total_damage"] / ROUNDS))
        print_f("\n"+"="*50)

    with open(RESULT_OUTPUT_DIR+slugify(character["name"])+".txt", "w") as f:
        f.write(RESULT_STR)

    RESULT_STR = ""

#####################################################################
# Main
print("---------------------------")
print("Zaphiel's Damage Calculator")
print("---------------------------")
print("Calculating...")

if not os.path.exists(RESULT_OUTPUT_DIR):
    os.mkdir(RESULT_OUTPUT_DIR)

# result = simulate(CHARACTER_EXAMPLE)

draw_multiple_result_plot([
    simulate({
        "name"                  : "20 barb / 7 wm / 3 rog",

        "ab"                    : 48,
        "base_apr"              : 4,
        "dual_wielding"         : False,
        "extra_attack"          : 2, # haste, etc
        "str_mod"               : 14,
        "overwhelming_critical" : False,
        "is_monk"               : False, # If character is monk, AB penalty is set to -3 from -5 for consecutively attacks.

        "weapon"                : {
            "name"                : "M. Damask Rapier",
            "damage"              : "1d6",
            "damage_bonus"        : 6 + 6,
            "threat_range"        : 10,
            "crit_multiplier"     : 3,
            "other_damage_bonus"  : [
                {"name" : "Sonic", "damage" : "1d6", "resistable" : True, "no_crit" : False},
                {"name" : "Positive", "damage" : "1d6", "resistable" : True, "no_crit" : False},
            ],
            "massive_crit"        : None
        }
    }),
    simulate({
        "name"                  : "20 f / 5 wm / 5 lm",

        "ab"                    : 50,
        "base_apr"              : 4 + 6,
        "dual_wielding"         : False,
        "extra_attack"          : 1, # haste, etc
        "str_mod"               : 14,
        "overwhelming_critical" : False,
        "is_monk"               : False, # If character is monk, AB penalty is set to -3 from -5 for consecutively attacks.

        "weapon"                : {
            "name"                : "Knight Commander's Sabre",
            "damage"              : "1d6",
            "damage_bonus"        : 4 + 6,
            "threat_range"        : 12,
            "crit_multiplier"     : 3,
            "other_damage_bonus"  : [
                {"name" : "Sonic", "damage" : "1d6", "resistable" : True, "no_crit" : False},
                {"name" : "Positive", "damage" : "1d6", "resistable" : True, "no_crit" : False},
            ],
            "massive_crit"        : "2d4"
        }
    }),
    simulate({
        "name"                  : "12 f / 7 wm / 11 as",

        "ab"                    : 48,
        "base_apr"              : 4,
        "dual_wielding"         : True,
        "extra_attack"          : 1, # haste, etc
        "str_mod"               : 7,
        "overwhelming_critical" : False,
        "is_monk"               : False, # If character is monk, AB penalty is set to -3 from -5 for consecutively attacks.

        "weapon"                : {
            "name"                : "Dead Man's Cross",
            "damage"              : "1d4",
            "damage_bonus"        : 6,
            "threat_range"        : 13,
            "crit_multiplier"     : 3,
            "other_damage_bonus"  : [
                {"name" : "Sonic", "damage" : "1d6", "resistable" : True, "no_crit" : False},
                {"name" : "Positive", "damage" : "1d6", "resistable" : True, "no_crit" : False},
                {"name" : "Divine", "damage" : "1d4", "resistable" : True, "no_crit" : False},
                {"name" : "Magic", "damage" : 16, "resistable" : False, "no_crit" : True},
            ],
            "massive_crit"        : None
        }
    })
])

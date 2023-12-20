use arelith::{character::Character, feat::feat_db::get_feat};

#[tauri::command]
pub fn is_debug() -> bool {
    #[cfg(debug_assertions)]
    return true;

    #[cfg(not(debug_assertions))]
    return false;
}

#[tauri::command]
pub fn test() -> Option<Character> {
    #[cfg(not(debug_assertions))]
    return None;

    Some(
        Character::builder()
            .name("Test Character".into())
            .ab(48)
            .ac(60)
            .feats(vec![get_feat("Blind Fight"), get_feat("Dual Wielding")])
            .build(),
    )
}

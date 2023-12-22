use crate::db;

#[tauri::command]
pub fn is_debug() -> bool {
    #[cfg(debug_assertions)]
    return true;

    #[cfg(not(debug_assertions))]
    return false;
}

#[tauri::command]
pub fn get_rows(table: &str) -> db::QueryResult<Vec<db::RowData>> {
    db::get_rows(&table)
}

#[tauri::command]
pub fn insert_row(table: &str, name: &str, json: &str) -> db::QueryResult<usize> {
    db::insert_row(table, name, json)
}

#[tauri::command]
pub fn delete_row(table: &str, id: i32) -> db::QueryResult<usize> {
    db::delete_row(table, id)
}

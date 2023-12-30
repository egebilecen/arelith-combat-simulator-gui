// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use commands::*;
use tauri::Manager;

fn main() {
    db::init_db();

    let tauri_builder = tauri::Builder::default().invoke_handler(tauri::generate_handler![
        is_debug,
        get_row_by_id,
        get_rows,
        insert_row,
        delete_row,
        delete_all_rows,
        get_base_weapons,
        create_character,
        create_weapon,
        start_simulation,
        start_threaded_simulation
    ]);

    #[cfg(debug_assertions)]
    let tauri_builder = tauri_builder.setup(|app| {
        {
            let window = app.get_window("main").unwrap();
            window.open_devtools();
        }
        Ok(())
    });

    tauri_builder
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Destroyed => {
                let window = event.window();

                if window.label() == "main" {
                    window.app_handle().exit(0);
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

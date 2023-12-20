// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
use commands::*;

fn main() {
    let tauri_builder =
        tauri::Builder::default().invoke_handler(tauri::generate_handler![is_debug, test]);

    #[cfg(debug_assertions)]
    let tauri_builder = tauri_builder.setup(|app| {
        {
            use tauri::Manager;

            let window = app.get_window("main").unwrap();
            window.open_devtools();
        }
        Ok(())
    });

    tauri_builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

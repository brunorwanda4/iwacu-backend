// Iwacu Database Layer Backend
// A Rust-based persistence and API service for Rwanda's civic mobile application

mod db;
mod models;

use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use serde_json::json;
use sqlx::PgPool;
use std::env;

/// Health check handler
/// 
/// Verifies that the server and database are running by executing a simple query.
/// Returns {"status":"ok","app":"iwacu"} on success or {"status":"error","app":"iwacu"} on failure.
async fn health_check(pool: web::Data<PgPool>) -> HttpResponse {
    match sqlx::query("SELECT 1").fetch_one(pool.get_ref()).await {
        Ok(_) => {
            println!("✓ Health check: OK");
            HttpResponse::Ok().json(json!({
                "status": "ok",
                "app": "iwacu"
            }))
        }
        Err(e) => {
            eprintln!("✗ Health check failed: {}", e);
            HttpResponse::ServiceUnavailable().json(json!({
                "status": "error",
                "app": "iwacu"
            }))
        }
    }
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Iwacu Database Layer Backend");
    println!("================================\n");
    
    // Load environment variables from .env file
    dotenv::dotenv().ok();
    println!("📝 Environment variables loaded from .env");
    
    // Create database connection pool
    let pool = match db::create_pool().await {
        Ok(p) => p,
        Err(e) => {
            eprintln!("❌ Failed to create database pool: {}", e);
            std::process::exit(1);
        }
    };
    
    // Run database migrations
    println!("\n🔄 Running database migrations...");
    match sqlx::migrate!("./migrations")
        .run(&pool)
        .await
    {
        Ok(_) => println!("✓ All migrations executed successfully"),
        Err(e) => {
            eprintln!("❌ Migration failed: {}", e);
            eprintln!("   Application refusing to start");
            std::process::exit(1);
        }
    }
    
    // Get server configuration from environment
    let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let server_port = env::var("SERVER_PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_addr = format!("{}:{}", server_host, server_port);
    
    println!("\n🌐 Starting Actix-Web server...");
    println!("   Listening on: http://{}", bind_addr);
    println!("   Health check: http://{}/health\n", bind_addr);
    
    // Create and start Actix-Web server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(middleware::Logger::default())
            .route("/health", web::get().to(health_check))
    })
    .bind(&bind_addr)?
    .run()
    .await
}


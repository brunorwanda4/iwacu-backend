// Database connection pool setup
// This module handles PostgreSQL connection pooling using SQLx

use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;

/// Create a PostgreSQL connection pool
/// 
/// Reads DATABASE_URL from environment variables and creates a pool
/// with max_connections set to 10 for efficient resource management.
/// 
/// # Errors
/// 
/// Returns an error if:
/// - DATABASE_URL environment variable is not set
/// - Connection to the database fails
pub async fn create_pool() -> Result<PgPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .map_err(|_| {
            eprintln!("ERROR: DATABASE_URL environment variable not set");
            sqlx::Error::Configuration("DATABASE_URL not set".into())
        })?;
    
    println!("📦 Creating database connection pool...");
    println!("   Database URL: {}", database_url.split('@').last().unwrap_or("unknown"));
    
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await?;
    
    println!("✓ Database connection pool created successfully (max_connections: 10)");
    
    Ok(pool)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires running database
    async fn test_pool_creation() {
        let pool = create_pool().await;
        assert!(pool.is_ok());
    }

    #[tokio::test]
    #[ignore] // Requires running database
    async fn test_pool_acquire_connection() {
        let pool = create_pool().await.expect("Failed to create pool");
        let conn = pool.acquire().await;
        assert!(conn.is_ok());
    }

    #[tokio::test]
    #[ignore] // Requires running database
    async fn test_pool_execute_query() {
        let pool = create_pool().await.expect("Failed to create pool");
        let result: (i32,) = sqlx::query_as("SELECT 1")
            .fetch_one(&pool)
            .await
            .expect("Failed to execute query");
        assert_eq!(result.0, 1);
    }
}

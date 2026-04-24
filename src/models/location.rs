use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Location struct representing a row in the locations table
/// Maps to all columns from the locations table including created_at
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Location {
    pub id: Uuid,
    pub name: String,
    pub name_kinyarwanda: Option<String>,
    pub level: i16,
    pub parent_id: Option<Uuid>,
    pub latitude: Option<Decimal>,
    pub longitude: Option<Decimal>,
    pub created_at: DateTime<Utc>,
}

/// LocationPublic struct for API responses
/// Excludes created_at timestamp
#[derive(Debug, Serialize, Deserialize)]
pub struct LocationPublic {
    pub id: Uuid,
    pub name: String,
    pub name_kinyarwanda: Option<String>,
    pub level: i16,
    pub parent_id: Option<Uuid>,
    pub latitude: Option<Decimal>,
    pub longitude: Option<Decimal>,
}

impl From<Location> for LocationPublic {
    fn from(location: Location) -> Self {
        LocationPublic {
            id: location.id,
            name: location.name,
            name_kinyarwanda: location.name_kinyarwanda,
            level: location.level,
            parent_id: location.parent_id,
            latitude: location.latitude,
            longitude: location.longitude,
        }
    }
}

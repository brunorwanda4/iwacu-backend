use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Citizen struct representing a row in the citizens table
/// Maps to all columns from the citizens table including created_at and updated_at
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Citizen {
    pub id: Uuid,
    pub national_id: String,
    pub first_name: String,
    pub last_name: String,
    pub phone_number: Option<String>,
    pub date_of_birth: Option<chrono::NaiveDate>,
    pub gender: Option<String>,
    pub home_location_id: Uuid,
    pub profile_photo_url: Option<String>,
    pub is_leader: bool,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// CitizenPublic struct for API responses
/// Excludes national_id, phone_number, and date_of_birth for privacy
#[derive(Debug, Serialize, Deserialize)]
pub struct CitizenPublic {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub gender: Option<String>,
    pub home_location_id: Uuid,
    pub profile_photo_url: Option<String>,
    pub is_leader: bool,
    pub is_active: bool,
}

impl From<Citizen> for CitizenPublic {
    fn from(citizen: Citizen) -> Self {
        CitizenPublic {
            id: citizen.id,
            first_name: citizen.first_name,
            last_name: citizen.last_name,
            gender: citizen.gender,
            home_location_id: citizen.home_location_id,
            profile_photo_url: citizen.profile_photo_url,
            is_leader: citizen.is_leader,
            is_active: citizen.is_active,
        }
    }
}

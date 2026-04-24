use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Leader struct representing a row in the leaders table
/// Maps to all columns from the leaders table including phone_number, email, and office_address
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Leader {
    pub id: Uuid,
    pub citizen_id: Option<Uuid>,
    pub location_id: Uuid,
    pub title: String,
    pub phone_number: Option<String>,
    pub email: Option<String>,
    pub office_address: Option<String>,
    pub office_latitude: Option<Decimal>,
    pub office_longitude: Option<Decimal>,
    pub profile_photo_url: Option<String>,
    pub bio: Option<String>,
    pub can_post_announcements: bool,
    pub is_active: bool,
    pub appointed_at: Option<NaiveDate>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// LeaderPublic struct for API responses
/// Excludes phone_number, email, and office_address for privacy
#[derive(Debug, Serialize, Deserialize)]
pub struct LeaderPublic {
    pub id: Uuid,
    pub citizen_id: Option<Uuid>,
    pub location_id: Uuid,
    pub title: String,
    pub office_latitude: Option<Decimal>,
    pub office_longitude: Option<Decimal>,
    pub profile_photo_url: Option<String>,
    pub bio: Option<String>,
    pub can_post_announcements: bool,
    pub is_active: bool,
    pub appointed_at: Option<NaiveDate>,
}

impl From<Leader> for LeaderPublic {
    fn from(leader: Leader) -> Self {
        LeaderPublic {
            id: leader.id,
            citizen_id: leader.citizen_id,
            location_id: leader.location_id,
            title: leader.title,
            office_latitude: leader.office_latitude,
            office_longitude: leader.office_longitude,
            profile_photo_url: leader.profile_photo_url,
            bio: leader.bio,
            can_post_announcements: leader.can_post_announcements,
            is_active: leader.is_active,
            appointed_at: leader.appointed_at,
        }
    }
}

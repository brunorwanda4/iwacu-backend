use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Announcement struct representing a row in the announcements table
/// Maps to all columns from the announcements table including body and attachment_url
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Announcement {
    pub id: Uuid,
    pub leader_id: Uuid,
    pub location_id: Uuid,
    pub title: String,
    pub body: String,
    pub category: Option<String>,
    pub is_urgent: bool,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub attachment_url: Option<String>,
    pub view_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// AnnouncementPublic struct for API responses
/// Excludes body and attachment_url
#[derive(Debug, Serialize, Deserialize)]
pub struct AnnouncementPublic {
    pub id: Uuid,
    pub leader_id: Uuid,
    pub location_id: Uuid,
    pub title: String,
    pub category: Option<String>,
    pub is_urgent: bool,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub view_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// AnnouncementSummary struct for list responses
/// Excludes body, attachment_url, and view_count
#[derive(Debug, Serialize, Deserialize)]
pub struct AnnouncementSummary {
    pub id: Uuid,
    pub leader_id: Uuid,
    pub location_id: Uuid,
    pub title: String,
    pub category: Option<String>,
    pub is_urgent: bool,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Announcement> for AnnouncementPublic {
    fn from(announcement: Announcement) -> Self {
        AnnouncementPublic {
            id: announcement.id,
            leader_id: announcement.leader_id,
            location_id: announcement.location_id,
            title: announcement.title,
            category: announcement.category,
            is_urgent: announcement.is_urgent,
            scheduled_at: announcement.scheduled_at,
            expires_at: announcement.expires_at,
            view_count: announcement.view_count,
            created_at: announcement.created_at,
            updated_at: announcement.updated_at,
        }
    }
}

impl From<Announcement> for AnnouncementSummary {
    fn from(announcement: Announcement) -> Self {
        AnnouncementSummary {
            id: announcement.id,
            leader_id: announcement.leader_id,
            location_id: announcement.location_id,
            title: announcement.title,
            category: announcement.category,
            is_urgent: announcement.is_urgent,
            scheduled_at: announcement.scheduled_at,
            expires_at: announcement.expires_at,
            created_at: announcement.created_at,
            updated_at: announcement.updated_at,
        }
    }
}

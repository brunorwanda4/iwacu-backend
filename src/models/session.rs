use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::net::IpAddr;
use uuid::Uuid;

/// Session struct representing a row in the sessions table
/// Maps to all columns from the sessions table including refresh_token
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Session {
    pub id: Uuid,
    pub citizen_id: Uuid,
    pub refresh_token: String,
    pub device_info: Option<String>,
    pub ip_address: Option<IpAddr>,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
}

/// SessionPublic struct for API responses
/// Excludes refresh_token for security
#[derive(Debug, Serialize, Deserialize)]
pub struct SessionPublic {
    pub id: Uuid,
    pub citizen_id: Uuid,
    pub device_info: Option<String>,
    pub ip_address: Option<IpAddr>,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
}

impl From<Session> for SessionPublic {
    fn from(session: Session) -> Self {
        SessionPublic {
            id: session.id,
            citizen_id: session.citizen_id,
            device_info: session.device_info,
            ip_address: session.ip_address,
            expires_at: session.expires_at,
            created_at: session.created_at,
            last_used_at: session.last_used_at,
        }
    }
}

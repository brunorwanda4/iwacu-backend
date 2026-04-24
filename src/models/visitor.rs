use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// VisitorRegistration struct representing a row in the visitor_registrations table
/// Maps to all columns from the visitor_registrations table including visitor_national_id and visitor_phone
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct VisitorRegistration {
    pub id: Uuid,
    pub host_citizen_id: Uuid,
    pub visitor_name: String,
    pub visitor_national_id: Option<String>,
    pub visitor_phone: Option<String>,
    pub purpose_of_visit: Option<String>,
    pub arrival_date: NaiveDate,
    pub expected_departure_date: Option<NaiveDate>,
    pub actual_departure_date: Option<NaiveDate>,
    pub location_id: Uuid,
    pub is_departed: bool,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// VisitorRegistrationPublic struct for API responses
/// Excludes visitor_national_id and visitor_phone for privacy
#[derive(Debug, Serialize, Deserialize)]
pub struct VisitorRegistrationPublic {
    pub id: Uuid,
    pub host_citizen_id: Uuid,
    pub visitor_name: String,
    pub purpose_of_visit: Option<String>,
    pub arrival_date: NaiveDate,
    pub expected_departure_date: Option<NaiveDate>,
    pub actual_departure_date: Option<NaiveDate>,
    pub location_id: Uuid,
    pub is_departed: bool,
    pub notes: Option<String>,
}

impl From<VisitorRegistration> for VisitorRegistrationPublic {
    fn from(registration: VisitorRegistration) -> Self {
        VisitorRegistrationPublic {
            id: registration.id,
            host_citizen_id: registration.host_citizen_id,
            visitor_name: registration.visitor_name,
            purpose_of_visit: registration.purpose_of_visit,
            arrival_date: registration.arrival_date,
            expected_departure_date: registration.expected_departure_date,
            actual_departure_date: registration.actual_departure_date,
            location_id: registration.location_id,
            is_departed: registration.is_departed,
            notes: registration.notes,
        }
    }
}

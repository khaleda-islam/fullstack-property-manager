// ── Shared fake data for all contractor pages ─────────────────────────────────

export const FAKE_REQUESTS = [
  {
    id: 1,
    subject:      "Heater not working",
    description:  "The heater in unit 3B stopped working completely. No heat since Monday morning. Resident is elderly and needs urgent attention.",
    priority:     "Emergency",
    status:       "Submitted",
    assignStatus: "Unassigned",
    photo:        "https://placehold.co/400x200/E74C3C/ffffff?text=Heater+Issue",
    property:     "Maple Residences",
    location:     "123 Maple St, Unit 3B, Toronto, ON",
    date:         "2026-03-18",
    landlord: {
      name:  "John Smith",
      email: "john.smith@email.com",
      photo: "https://placehold.co/48x48/4A90D9/ffffff?text=JS",
    },
  },
  {
    id: 2,
    subject:      "Leaking faucet in kitchen",
    description:  "Kitchen faucet has been dripping for two weeks. Water damage is starting to appear under the sink cabinet.",
    priority:     "Urgent",
    status:       "Submitted",
    assignStatus: "Unassigned",
    photo:        "https://placehold.co/400x200/3498DB/ffffff?text=Leaking+Faucet",
    property:     "Sunset Apartments",
    location:     "456 Sunset Blvd, Unit 1A, Vancouver, BC",
    date:         "2026-03-17",
    landlord: {
      name:  "Sarah Connor",
      email: "sarah.c@email.com",
      photo: "https://placehold.co/48x48/E67E22/ffffff?text=SC",
    },
  },
  {
    id: 3,
    subject:      "Broken window lock",
    description:  "The bedroom window lock is broken and cannot be secured. Security concern for the resident.",
    priority:     "Standard",
    status:       "Submitted",
    assignStatus: "Unassigned",
    photo:        "https://placehold.co/400x200/95A5A6/ffffff?text=Window+Lock",
    property:     "Oak Park Condos",
    location:     "789 Oak Ave, Unit 7C, Calgary, AB",
    date:         "2026-03-16",
    landlord: {
      name:  "Mike Johnson",
      email: "mike.j@email.com",
      photo: "https://placehold.co/48x48/27AE60/ffffff?text=MJ",
    },
  },
  {
    id: 4,
    subject:      "Mold in bathroom ceiling",
    description:  "Black mold spotted near bathroom vent. Growing over the past month and spreading.",
    priority:     "Urgent",
    status:       "Submitted",
    assignStatus: "Unassigned",
    photo:        "https://placehold.co/400x200/8E44AD/ffffff?text=Mold+Issue",
    property:     "Riverside Townhomes",
    location:     "321 River Rd, Unit 2D, Ottawa, ON",
    date:         "2026-03-15",
    landlord: {
      name:  "Emily Davis",
      email: "emily.d@email.com",
      photo: "https://placehold.co/48x48/C0392B/ffffff?text=ED",
    },
  },
];

export const FAKE_MY_JOBS = [
  {
    id: 5,
    subject:      "Elevator out of service",
    description:  "Main elevator has been out of service for 3 days. Elderly residents on higher floors are affected.",
    priority:     "Emergency",
    status:       "In Progress",
    assignStatus: "Assigned",
    photo:        "https://placehold.co/400x200/8E44AD/ffffff?text=Elevator",
    property:     "Cedar Grove Suites",
    location:     "654 Cedar Ln, Common Area, Montreal, QC",
    date:         "2026-03-14",
    landlord: {
      name:  "Robert Chen",
      email: "robert.c@email.com",
      photo: "https://placehold.co/48x48/16A085/ffffff?text=RC",
    },
  },
  {
    id: 6,
    subject:      "Broken intercom system",
    description:  "Building intercom is not working. Residents cannot buzz in guests.",
    priority:     "Urgent",
    status:       "Submitted",
    assignStatus: "Assigned",
    photo:        "https://placehold.co/400x200/2980B9/ffffff?text=Intercom",
    property:     "Pine Valley Flats",
    location:     "987 Pine St, Common Area, Edmonton, AB",
    date:         "2026-03-13",
    landlord: {
      name:  "John Smith",
      email: "john.smith@email.com",
      photo: "https://placehold.co/48x48/4A90D9/ffffff?text=JS",
    },
  },
];

export const FAKE_PAST_JOBS = [
  {
    id: 7,
    subject:      "Parking lot light out",
    description:  "Two parking lot lights replaced and tested successfully.",
    priority:     "Standard",
    status:       "Completed",
    assignStatus: "Completed",
    photo:        "https://placehold.co/400x200/F39C12/ffffff?text=Parking+Light",
    property:     "Pine Valley Flats",
    location:     "987 Pine St, Parking Area, Edmonton, AB",
    date:         "2026-03-10",
    completedDate:"2026-03-12",
    landlord: {
      name:  "John Smith",
      email: "john.smith@email.com",
      photo: "https://placehold.co/48x48/4A90D9/ffffff?text=JS",
    },
  },
  {
    id: 8,
    subject:      "Roof leak repair",
    description:  "Roof leak above unit 8D was patched and waterproofed successfully.",
    priority:     "Emergency",
    status:       "Completed",
    assignStatus: "Completed",
    photo:        "https://placehold.co/400x200/C0392B/ffffff?text=Roof+Leak",
    property:     "Willow Creek Manor",
    location:     "222 Willow Dr, Unit 8D, Halifax, NS",
    date:         "2026-03-08",
    completedDate:"2026-03-09",
    landlord: {
      name:  "Sarah Connor",
      email: "sarah.c@email.com",
      photo: "https://placehold.co/48x48/E67E22/ffffff?text=SC",
    },
  },
  {
    id: 9,
    subject:      "Broken door hinge",
    description:  "Front door hinge on unit 2A replaced and door realigned.",
    priority:     "Standard",
    status:       "Completed",
    assignStatus: "Completed",
    photo:        "https://placehold.co/400x200/27AE60/ffffff?text=Door+Hinge",
    property:     "Oak Park Condos",
    location:     "789 Oak Ave, Unit 2A, Calgary, AB",
    date:         "2026-03-05",
    completedDate:"2026-03-06",
    landlord: {
      name:  "Mike Johnson",
      email: "mike.j@email.com",
      photo: "https://placehold.co/48x48/27AE60/ffffff?text=MJ",
    },
  },
];

export const FAKE_RATINGS = [
  {
    id: 1,
    landlord: {
      name:  "John Smith",
      email: "john.smith@email.com",
      photo: "https://placehold.co/48x48/4A90D9/ffffff?text=JS",
    },
    rating:  9,
    comment: "Excellent work! Fixed the parking lot lights quickly and professionally. Very reliable contractor.",
    date:    "2026-03-13",
    job:     "Parking lot light out",
  },
  {
    id: 2,
    landlord: {
      name:  "Sarah Connor",
      email: "sarah.c@email.com",
      photo: "https://placehold.co/48x48/E67E22/ffffff?text=SC",
    },
    rating:  8,
    comment: "Great job on the roof repair. Completed on time and the work quality was very good.",
    date:    "2026-03-10",
    job:     "Roof leak repair",
  },
  {
    id: 3,
    landlord: {
      name:  "Mike Johnson",
      email: "mike.j@email.com",
      photo: "https://placehold.co/48x48/27AE60/ffffff?text=MJ",
    },
    rating:  10,
    comment: "Perfect! Fixed the door hinge perfectly. Very professional and clean work.",
    date:    "2026-03-07",
    job:     "Broken door hinge",
  },
];

export const PRIORITY_CONFIG = {
  "Standard":  { badge: "info",    icon: "bi-flag"                     },
  "Urgent":    { badge: "warning", icon: "bi-flag-fill"                 },
  "Emergency": { badge: "danger",  icon: "bi-exclamation-triangle-fill" },
};

export const STATUS_CONFIG = {
  "Submitted":   { badge: "secondary", icon: "bi-clock"        },
  "In Progress": { badge: "warning",   icon: "bi-arrow-repeat" },
  "Completed":   { badge: "success",   icon: "bi-check-circle" },
};

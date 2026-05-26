-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE registration_type_enum AS ENUM ('healthcare_professional', 'exhibitor_industry', 'hackathon_innovator');
CREATE TYPE participation_type AS ENUM ('solo', 'team');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration_type registration_type_enum NOT NULL,
  participation participation_type NOT NULL,
  team_name VARCHAR(255),
  status registration_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  member_role VARCHAR(255)
);

-- Exhibitor applications table
CREATE TABLE exhibitor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry_type VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  description TEXT,
  booth_size VARCHAR(50),
  status registration_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule items table
CREATE TABLE schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day INT NOT NULL CHECK (day >= 1 AND day <= 3),
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  status ticket_status DEFAULT 'open',
  priority ticket_priority DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket messages table
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_exhibitor_applications_user_id ON exhibitor_applications(user_id);
CREATE INDEX idx_exhibitor_applications_status ON exhibitor_applications(status);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_users_email ON users(email);

-- Seed data: Admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@digitalhealthforum.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDeBlkxiRlO.JYm', 'Forum Admin', 'admin');

-- Seed data: Schedule items (Day 1 = July 3, Day 2 = July 4, Day 3 = July 5)
INSERT INTO schedule_items (day, start_time, end_time, title, description, order_index) VALUES
(1, '08:00', '09:00', 'Registration & Networking Breakfast', 'Welcome and coffee', 1),
(1, '09:00', '09:30', 'Opening Ceremony & Welcome Address', 'Official opening remarks', 2),
(1, '09:30', '11:00', 'Keynote Sessions: Digital Health Transformation', 'Key presentations on digital health', 3),
(1, '11:00', '11:30', 'Coffee Break & Exhibition Hall', 'Networking opportunity', 4),
(1, '11:30', '13:00', 'Panel Discussions & Breakout Sessions', 'Industry expert panels', 5),
(1, '13:00', '14:00', 'Networking Lunch', 'Lunch and networking', 6),
(1, '14:00', '16:00', 'Hackathon Presentations & Awards', 'Innovation showcase', 7),
(1, '16:00', '17:00', 'Closing Remarks & Networking Reception', 'Day 1 wrap-up', 8);

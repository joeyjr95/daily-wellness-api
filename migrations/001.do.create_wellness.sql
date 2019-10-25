CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  nickname TEXT,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  date_modified TIMESTAMP
);

CREATE TABLE reflections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id)
  ON DELETE SET NULL,
  physical_rating INTEGER NOT NULL,
  physical_content TEXT NOT NULL,
  mental_rating INTEGER NOT NULL,
  mental_content TEXT NOT NULL,
  date_created TIMESTAMP DEFAULT now() NOT NULL
);
-- Up
CREATE TABLE Roles (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO Roles (id, name) VALUES (1, 'Admin');
INSERT INTO Roles (id, name) VALUES (2, 'User');

CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT, -- sha256 hash of the plain-text password
    salt TEXT, -- salt that is appended to the password before it is hashed
    roleId TEXT,
    CONSTRAINT Users_fk_roleId FOREIGN KEY (roleId)
    	REFERENCES Roles (id) ON UPDATE CASCADE ON DELETE CASCADE
);




-- Down
DROP TABLE Users;
DROP TABLE Roles;
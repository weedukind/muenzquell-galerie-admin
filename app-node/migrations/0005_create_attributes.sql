CREATE TABLE attribute_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (name)
);

CREATE TABLE attribute_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attribute_type_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (attribute_type_id, name),
    UNIQUE (id, attribute_type_id),
    CONSTRAINT fk_attribute_options_type FOREIGN KEY (attribute_type_id) REFERENCES attribute_types (id) ON DELETE CASCADE
);

CREATE TABLE upload_attributes (
    upload_id INTEGER NOT NULL,
    attribute_type_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    PRIMARY KEY (upload_id, attribute_type_id),
    CONSTRAINT fk_upload_attributes_upload FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE,
    CONSTRAINT fk_upload_attributes_type FOREIGN KEY (attribute_type_id) REFERENCES attribute_types (id) ON DELETE CASCADE,
    CONSTRAINT fk_upload_attributes_option FOREIGN KEY (option_id, attribute_type_id) REFERENCES attribute_options (id, attribute_type_id)
);

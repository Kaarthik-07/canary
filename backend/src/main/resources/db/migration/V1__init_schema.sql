-- V1: initial schema (4 tables). Flyway runs this inside the canary_shop schema.

CREATE TABLE users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER',
    cohort          VARCHAR(20)  NOT NULL DEFAULT 'CONTROL',
    feature_enabled BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email  UNIQUE (email),
    CONSTRAINT ck_users_role   CHECK (role   IN ('USER', 'ADMIN')),
    CONSTRAINT ck_users_cohort CHECK (cohort IN ('CANARY', 'CONTROL'))
);
CREATE INDEX idx_users_cohort ON users (cohort);

CREATE TABLE products (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(200)  NOT NULL,
    description    TEXT,
    price          NUMERIC(12,2) NOT NULL,
    image_url      VARCHAR(500),
    stock_quantity INTEGER       NOT NULL DEFAULT 0,
    category       VARCHAR(100),
    active         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT ck_products_price CHECK (price >= 0),
    CONSTRAINT ck_products_stock CHECK (stock_quantity >= 0)
);
CREATE INDEX idx_products_active_category ON products (active, category);

CREATE TABLE orders (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID          NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status       VARCHAR(20)   NOT NULL DEFAULT 'CART',
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT fk_orders_user   FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_orders_total  CHECK (total_amount >= 0),
    CONSTRAINT ck_orders_status CHECK (status IN ('CART', 'PLACED', 'CANCELLED'))
);
-- at most ONE cart per user, enforced by the database itself
CREATE UNIQUE INDEX uq_orders_one_cart_per_user ON orders (user_id) WHERE status = 'CART';
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

CREATE TABLE order_items (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   UUID          NOT NULL,
    product_id UUID          NOT NULL,
    quantity   INTEGER       NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    subtotal   NUMERIC(12,2) NOT NULL,
    CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders (id)   ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT,
    CONSTRAINT uq_order_items_order_product UNIQUE (order_id, product_id),
    CONSTRAINT ck_order_items_qty      CHECK (quantity > 0),
    CONSTRAINT ck_order_items_price    CHECK (unit_price >= 0),
    CONSTRAINT ck_order_items_subtotal CHECK (subtotal >= 0)
);
CREATE INDEX idx_order_items_product ON order_items (product_id);

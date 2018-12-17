DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE departments(
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(45) NOT NULL,
  over_head_costs INT default 1000,
  primary key(department_id)
);

CREATE TABLE products(
  id INT NOT NULL AUTO_INCREMENT,
  item_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price INT default 0,
  stock_quantity INT default 0,
  product_sales INT default 0,
  PRIMARY KEY (id)
);


INSERT INTO departments (department_name, over_head_costs)
values ("Electronics", 10000);
INSERT INTO departments (department_name, over_head_costs)
values ("Kitchen", 10000);

INSERT INTO products (item_name, department_name, price, stock_quantity)
            VALUES ("LIRI", "Electronics", 90, 20);
INSERT INTO products (item_name, department_name, price, stock_quantity)
            VALUES ("Switch", "Electronics", 90, 20);
INSERT INTO products (item_name, department_name, price, stock_quantity)
            VALUES ("PS4", "Electronics", 90, 20);
            
            
INSERT INTO products (item_name, department_name, price, stock_quantity)
			VALUES ("Kife", "Kitchen", 1, 25);
INSERT INTO products (item_name, department_name, price, stock_quantity)
			VALUES ("Fork", "Kitchen", 1, 25);
INSERT INTO products (item_name, department_name, price, stock_quantity)
			VALUES ("Spoon", "Kitchen", 1, 25);

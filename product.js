function Product( name, dept, price, stock_quantity){

    this.item_name = name;
    this.department_name = dept;
    this.price = price;
    this.stock_quantity = stock_quantity;
}

module.exports = Product;
const {
  Card,
  Accordion,
  Button,
  Container,
  Row,
  Col,
  Image,
  Input,
} = ReactBootstrap;
const { Fragment, useState, useEffect, useReducer } = React;

const Products = () => {
  
  const [items, setItems]           = useState([]);
  const [cart, setCart]             = useState([]);
  const [emptyStock, setEmptyStock] = useState(true);
  const [total, setTotal]           = useState(0);
  const [query, setQuery]           = useState("http://localhost:8082/products");
 
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:8082/products",
    {
      data: [],
    }
  );

  console.log(`Rendering Products ${JSON.stringify(data)}`);
  
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => {return (item.name == name)});
    if (item[0].instock == 0) return;
    item[0].instock -= 1;
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
    //doFetch(query);
  };

  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => i != index);
    let returnedItem = cart.filter((item, i) => i == index);
    let newItems = items.map((item) => {
      if(item.name == returnedItem[0].name) item.instock += 1;
      return item;
    });
    setCart(newCart);
    setItems(newItems)
  };

  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name} ${item.cost} ( In stock: {item.instock} )
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });


  let cartList = cart.map((item, index) => {
    
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            ${item.cost} {item.name} from {item.country}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          eventKey={1 + index}
        >
          <Card.Body>
            <button onClick={() => deleteCartItem(index)} >Return Item?</button>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return {final , total};
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, total);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
    // setTotal(newTotal);
  };

  const findZeroInstock = (stockItems) => {
    console.log(stockItems)
    if (emptyStock) {
      setItems([...stockItems])
      setEmptyStock(false);
    } else {
        for (const item of items) {
          if (item.instock == 0) {
            let targetItem = item;
            console.log('else statement fired');
            let neededItem = stockItems.find((item) => item.name == targetItem.name ) 
            console.log(neededItem)
            targetItem.instock = neededItem.instock;
          }
        }
      setItems([...items]);
      }; 

  };

  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
   
    console.log("this-->", items)
    
    //filter data into newItems
    let newItems = data.map((item) => {
      let {name, country, cost, instock} = item;
      return {name, country, cost, instock};
    });
    
    findZeroInstock(newItems);
   
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut} >CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(query);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
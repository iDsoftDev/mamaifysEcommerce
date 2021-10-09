import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PaystackButton } from 'react-paystack';
import { Link } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core/';
import ErrorMessage from '../components/Message/errorMessage';
import Message from '../components/InfoMessage/Message';
import Loader from '../components/Loader/Loader';
import { getOrder, payOrder, deliverOrder } from '../actions/orderAction';
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants';
import { interpolate } from '../utils/string';
// import config from '../config';
import * as routes from '../constants/routes';
import OrderLoader from '../components/Loader/OrderLoader';

const Order = ({ match }) => {
  const orderId = match.params.orderId;

  const [sdkReady, setSdkReady] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error, success } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPayMessage } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const queryParams = new URLSearchParams(window.location.search);

  const refId = queryParams.get('refId') ? queryParams.get('refId').trim() : null;

  useEffect(() => {
    const addPayStackScript = async () => {
      const { data: clientId } = await axios.get('/api/config/paystack');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://js.paystack.co/v1/inline.js?client-id=${clientId}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    if (order && !order.isPaid) {
      if (!window.paystack) {
        addPayStackScript();
      } else {
        setSdkReady(true);
      }
    }
    // eslint-disable-next-line
  }, [dispatch, orderId, successPayMessage, successDeliver, order]);

  useEffect(() => {
    dispatch({ type: ORDER_PAY_RESET });
    dispatch({ type: ORDER_DELIVER_RESET });
    dispatch(getOrder(orderId, initialLoading));

    // eslint-disable-next-line
  }, [dispatch, successPayMessage, successDeliver, refId]);

  useEffect(() => {
    if (success && initialLoading) {
      setInitialLoading(false);
    }
    // eslint-disable-next-line
  }, [dispatch, success]);

  useEffect(() => {
    if (refId) {
      dispatch(payOrder(orderId));
    }
    // eslint-disable-next-line
  }, [refId]);

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult));
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order._id));
  };

  // const payWith = () => {
  //   var resultId = '';
  //   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //   var charactersLength = characters.length;
  //   for (var i = 0; i < 14; i++) {
  //     resultId += characters.charAt(Math.floor(Math.random() * charactersLength));
  //   }

  //   var path = config.esewaPaymentUrl;
  //   var params = {
  //     amt: order.itemsPrice,
  //     psc: order.shippingPrice,
  //     pdc: 0,
  //     txAmt: order.taxPrice,
  //     tAmt: order.totalPrice,
  //     pid: resultId,
  //     scd: 'EPAYTEST',
  //     su: `http://localhost:3000/order/${orderId}`,
  //     fu: `http://localhost:3000/order/${orderId}`,
  //   };
  //   var form = document.createElement('form');
  //   form.setAttribute('method', 'POST');
  //   form.setAttribute('action', path);

  //   Object.keys(params).forEach((key) => {
  //     var hiddenField = document.createElement('input');
  //     hiddenField.setAttribute('type', 'hidden');
  //     hiddenField.setAttribute('name', key);
  //     hiddenField.setAttribute('value', params[key]);
  //     form.appendChild(hiddenField);
  //   });

  //   document.body.appendChild(form);
  //   form.submit();
  // };

  return loading ? (
    <OrderLoader />
  ) : error ? (
    <ErrorMessage header="Something went wrong" message={error} />
  ) : (
    <>
      {order ? (
        <>
          <h1>Order {order._id}</h1>
          <Row>
            <Col md={8}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h2>Shipping</h2>
                  <p>
                    <strong>Name: </strong> {order.userId.name}
                  </p>
                  <p>
                    <strong>Email: </strong> <a href={`mailto:${order.userId.email}`}>{order.userId.email}</a>
                  </p>
                  <p>
                    <strong>Address:</strong> {order.shipping.address},{order.shipping.city} {order.shipping.phoneNumber}
                    , {order.shipping.country}
                  </p>
                  {order.isDelivered ? (
                    <Message variant="success">Delivered on {order.deliveredAt}</Message>
                  ) : (
                    <Message variant="danger">Not Delivered</Message>
                  )}
                </ListGroup.Item>

                <ListGroup.Item>
                  <h2>Payment Method</h2>
                  <p>
                    <strong>Method: </strong>
                    {order.payment ? order.payment.paymentMethod : ''}
                  </p>
                  {order.isPaid ? (
                    <Message variant="success">Paid on {order.paidAt}</Message>
                  ) : (
                    <Message variant="danger">Not Paid</Message>
                  )}
                </ListGroup.Item>

                {order.orderItems ? (
                  <ListGroup.Item>
                    <h2>Order Items</h2>
                    {!order.orderItems.length ? (
                      <Message>Order is empty</Message>
                    ) : (
                      <ListGroup variant="flush">
                        {order.orderItems.map((item, index) => (
                          <ListGroup.Item key={index}>
                            <Row>
                              <Col md={1}>
                                <Image src={item.productImage} alt={item.productName} fluid rounded />
                              </Col>
                              <Col>
                                <Link
                                  to={interpolate(routes.PRODUCT, {
                                    productId: item.productId,
                                  })}
                                >
                                  {item.productName}
                                </Link>
                              </Col>
                              <Col md={4}>
                                {item.qty} x NGN{item.price} = NGN{item.qty * item.price}
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </ListGroup.Item>
                ) : (
                  ''
                )}
              </ListGroup>
            </Col>
            <Col md={4}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <h2>Order Summary</h2>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col>NGN{order.itemsPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping</Col>
                      <Col>NGN{order.shippingPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Tax</Col>
                      <Col>NGN{order.taxPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Total</Col>
                      <Col>NGN{order.totalPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  {order.payment && order.payment.paymentMethod === 'PayStack' && !order.isPaid && (
                    <ListGroup.Item>
                      {loadingPay && <Loader />}
                      {!sdkReady ? (
                        <Loader />
                      ) : (
                        <Button type="submit" variant="contained" color="primary" fullWidth >

                        
                        <PaystackButton text={'Click to make payment'} reference ={(new Date()).getTime().toString()} email={order.userId.email}
                                         publicKey = {"pk_live_76ea25e351b689e556b34a568b0505d21dda6d9b"} 
                                         amount={order.totalPrice * 100} 
                                         onSuccess={successPaymentHandler} />
                                         </Button>
                      )}
                    </ListGroup.Item>
                  )}
                  {/* {order.payment && order.payment.paymentMethod === 'esewa' && !order.isPaid && (
                    <ListGroup.Item>
                      <Button variant="outlined" color="primary" fullWidth onClick={payWithEsewa}>
                      </Button>
                    </ListGroup.Item>
                  )} */}

                  {loadingDeliver && <Loader />}
                  {userInfo && userInfo.role === 'admin' && order.isPaid && !order.isDelivered && (
                    <ListGroup.Item>
                      <Button type="submit" variant="contained" color="primary" fullWidth onClick={deliverHandler}>
                        Mark As Delivered
                      </Button>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default Order;

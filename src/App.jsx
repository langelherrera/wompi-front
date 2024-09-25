import Guitar from "./components/Guitar"
import Header from "./components/Header"
import {useState,useEffect} from 'react'
import { Modal, Button } from 'react-bootstrap';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import ClipLoader from "react-spinners/ClipLoader";

function App() {

  //state
  const initialCart=()=>{
    const localStorageCart=localStorage.getItem('cart');
    return localStorageCart ? JSON.parse(localStorageCart):[];
  }
  
  const [status, setStatus] = useState('');

  const [cart,setCart]=useState(initialCart);
  
  const [products,setProducts]=useState([]);
  const [transaction,setTransaction]=useState([]);
  const [showModal, setShowModal] = useState(false);
  const[summaryModal,setsummaryModal]=useState(false);
  const [guitar,setGuitar]=useState([]);
  const [acceptanceToken, setAcceptanceToken] = useState('');
  const [acceptanceToken2, setAcceptanceToken2] = useState('');

  const [card, setCard]=useState('');
  const [creditcard,setCreditCard]=useState('')
  const [formData, setFormData] = useState({
    number: '',
    cvc: '',
    exp_month: '',
    exp_year: '',
    card_holder: ''
  });
  
  const [paymentMethod,setPaymentMethod]=useState(false);
  const [methodId,setMethodId]=useState(0);
 
 const [reload, setReload] =useState('false')
 const [loading, setLoading] = useState('false');
  
  useEffect(() => {
    getAllProducts();
    setCard('');
    setAcceptanceToken('');
    setAcceptanceToken2('');
    setPaymentMethod(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (acceptanceToken!='' && paymentMethod==false) {
      const payload=JSON.stringify(formData);
      //tokenizamos la tarjeta
       tokenCard(payload);
    }
  }, [acceptanceToken]);


  useEffect(() => {
    if (acceptanceToken2!='' && paymentMethod==true) {
      //obtener segundo token
      setPaymentMethod(false);
      const wompiTransaction={
        acceptance_token:acceptanceToken2,
        amount_in_cents:transaction.amount,
        currency:"COP",
        signature:transaction.secretIntegrity,
        customer_email:"pepito_perez@example.com",
        payment_method:{
          type: "CARD",
          installments:1,
          token:creditcard, 
        },
        payment_source_id:methodId,
        recurrent:true,
        reference:transaction.reference,
        expiration_time:transaction.dateExpiration,
        /*
        redirect_url: "https://2974-181-234-222-129.ngrok-free.app/wompi/validate",
        
        
        customer_data: {
        phone_number: "573307654321",
        full_name: formData.card_holder,
        legal_id: "1234567890",
        legal_id_type: "CC"
      },
      shipping_address: {
        address_line_1: "Calle 34 # 56 - 78",
        address_line_2: "Apartamento 502, Torre I",
        country: "CO",
        region: "Cundinamarca",
        city: "Bogotá",
        name: formData.card_holder,
        phone_number: "573109999999",
        postal_code: "111111"
      }
        */
      }
      
      sendWompiTr(wompiTransaction);
      
    }
  }, [acceptanceToken2]);

  useEffect(() => {
    if (card.includes('tok_')) {
      
      const creditcard= card;
      const acceptance_token=acceptanceToken;
      setCreditCard(creditcard);
      setCard('');
      //setAcceptanceToken('');
      createPaymentMethod(creditcard,acceptance_token);
      
    }
    }, [card]);
 
  useEffect(()=>{
    if(paymentMethod===true){
      
      createWompiTransaction();
      
      
    }
 },[paymentMethod])


  

useEffect(()=>{
  if(reload===true){
    getAllProducts();
    setCard('');
    setAcceptanceToken('');
    setAcceptanceToken2('');
    setPaymentMethod(false);
    setReload(false);
    setLoading(false);
  }
},[reload])

useEffect(()=>{
  if(loading==true){
    
  }
},[loading])

  function increaseItemQuantity(id){
    const updateCart=cart.map(item=>{
      if(item.id===id){
        return{...item,
          quantity:item.quantity+1
        }
      }
      return item;
    })
    setCart(updateCart)
  }


  function  decrementItemQuantity(id){
    const updateCart=cart.map(item=>{
      if(item.id===id && item.quantity>1){
        return{...item,
          quantity:item.quantity-1
        }
      }
      return item;
    })
    setCart(updateCart)
    
  }

  function cleanCart(){
    setCart([])
  }

 async function getAllProducts(){

  const response = await axios.get("https://wompi-production.up.railway.app/products");
  if(response.status==200){
    setProducts(response.data);
    return response.data;
  }
 
 }

 async function payWithCreditCard(guitar) {
  const body = {
  "description":  guitar.name,
  "status":"NEW",
  "amount": guitar.price,
  "product": guitar.id
  }
  const response= await axios.post("https://wompi-production.up.railway.app/transactions",body);
  const transactionData=response.data;
  
  setShowModal(true);
  setGuitar(guitar);
  setTransaction(transactionData);

}


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.cvc || !formData.number || !formData.exp_month || !formData.exp_year || !formData.card_holder) {
    alert("Por favor, completa todos los campos requeridos.");
    return; 
  }
  
  setShowModal(false);
  setLoading(true);
  //solicitamps el accest
  await acceptance_token();
  
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });
};

async function acceptance_token(){
  const response = await axios.get("https://wompi-production.up.railway.app/wompi/acceptance_token");
 
  if(response.status==200){
    setAcceptanceToken(response.data);
  }
  

}

async function acceptance_token2(){
  const response = await axios.get("https://wompi-production.up.railway.app/wompi/acceptance_token");
  
  if(response.status==200){
    setAcceptanceToken2(response.data);
  }
  

}
async function tokenCard(payload){


  try{
    const response = await axios.post('https://wompi-production.up.railway.app/wompi/token/card', formData);
    //tokenizando
  
    if(response.status===201){

      const tokenId= response.data;
      setCard(tokenId);
      
    }
  }catch(error){
    
  }  
  
}

async function createPaymentMethod(creditcard,acceptance_token){

  const body ={
    'type' : "CARD",
    'token': creditcard,
    "customer_email": "pepito_perez@example.com",
    'acceptance_token': acceptance_token
    
  }
// CREATE PAYMENT METHOD IN WOMPI
 const response =await axios.post('https://wompi-production.up.railway.app/wompi',body);
  
 if(response.data.id!=undefined || response.data!=null){
    setMethodId(response.data.id)
    setPaymentMethod(true);
 }else{
    setPaymentMethod(false);
 }
  
}

async function createWompiTransaction() {
 const token= await acceptance_token2()
}

async function sendWompiTr(wompiTransaction) {
  
  const response = await axios.post('https://wompi-production.up.railway.app/wompi/transaction',wompiTransaction)
  
  if(response.data.data.id!=undefined){
     
    const serverResponse= await axios.get(`https://wompi-production.up.railway.app/wompi/reference/${transaction.reference}`)
     //datos de transaccion
     const{data}= serverResponse.data;
     const {status}=data[0];
    
     setStatus(status);
     
     if(status=='APPROVED'){
      setLoading(false);
      setsummaryModal(true);
      const updateStop= await axios.patch(`https://wompi-production.up.railway.app/products/stock/${transaction.product}`);
        if(updateStop.status==200){
          setReload(true);
          const tr={
            status:'APPROVED'
          }
          const updtaTrStatus= await axios.patch(`https://wompi-production.up.railway.app/transactions/${transaction.id}`,tr);
          
        }
     }
     else if(status=='PENDING'){
     
      const serverResponse= await axios.get(`https://wompi-production.up.railway.app/wompi/reference/${transaction.reference}`)
      //datos de transaccion
      const{data}= serverResponse.data;
      const {status}=data[0];
      setStatus(status);
      
      if(status=='APPROVED'){
        setLoading(false);
        setsummaryModal(true);
        const updateStop= await axios.patch(`https://wompi-production.up.railway.app/products/stock/${transaction.product}`);
          if(updateStop.status==200){
            setReload(true);
            const tr={
              status:'APPROVED'
            }
            const updtaTrStatus= await axios.patch(`https://wompi-production.up.railway.app/transactions/${transaction.id}`,tr);
            setLoading(false);
          }
       }
       else if(status=='DECLINED'){
        setLoading(false);
        setsummaryModal(true);
        setReload(true);
            const tr={
              status:'DECLINED'
            }
            const updtaTrStatus= await axios.patch(`https://wompi-production.up.railway.app/transactions/${transaction.id}`,tr);
       }
     }
     else if(status=='DECLINED'){
      setLoading(false);
      setsummaryModal(true);
      setReload(true);
          const tr={
            status:'DECLINED'
          }
          const updtaTrStatus= await axios.patch(`https://wompi-production.up.railway.app/transactions/${transaction.id}`,tr);
     }
  }
  
}

async function camcelTr() {
  setShowModal(false);
  const tr={
    status:'CANCELED'
  }
  const updtaTrStatus= await axios.patch(`https://wompi-production.up.railway.app/transactions/${transaction.id}`,tr);
}
  
  return (
    <>
    <Header 
    
    
    decrementItemQuantity={decrementItemQuantity}
    cleanCart={cleanCart}
    cart={cart}/>
    
    

    <main className="container-xl mt-5">
        <h2 className="text-center">Nuestra Colección</h2>

        <div className="row mt-5">
          {products.map((guitar)=>(
            <Guitar
              key={guitar.id}
              guitar={guitar}
              payWithCreditCard={payWithCreditCard}
            />
          ))}
           
        </div>
    </main>


    <footer className="bg-dark mt-5 py-5">
        <div className="container-xl">
            <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
        </div>
    </footer>


    <Modal show={showModal} >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {guitar ? (
            <>
              
              <form id="payment-form" className="form">
              <div className="form-group">
                <label className="fw-black text-primary fs-6" htmlFor="number">Número de tarjeta</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '200px' }}
                  maxLength={16} 
                  required
                />
              </div>
  
              <div className="form-group">
                <label className="fw-black text-primary fs-7" htmlFor="cvc">CVC</label>
                  <input
                    required
                    
                    type="text"
                    id="cvc"
                    name="cvc"
                    style={{ width: '60px' }}
                    value={formData.cvc}
                    onChange={handleChange}
                    className="form-control"
                    maxLength={3}  
                    
                  />
              </div>
              <label className="fw-black text-primary fs-7" htmlFor="exp_month">Mes de expiración</label>
              <select
                id="exp_month"
                name="exp_month"
                value={formData.exp_month}
                onChange={handleChange}
                style={{ width: '60px' }}
                className="form-control"
                required
              >
                <option value="">Mes</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, '0'); 
                  return (
                    <option key={month} value={month}>
                      {month} 
                    </option>
                  );
                })}
              </select>
              <div className="form-group">
                <label className="fw-black text-primary fs-7" htmlFor="exp_year">Año de expiración</label>
                <select
                  id="exp_year"
                  name="exp_year"
                  value={formData.exp_year}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '60px' }}
                  required
                >
                  <option value="" disabled>Año</option>
                  {Array.from({ length: 16 }, (_, i) => 25 + i).map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="fw-black text-primary fs-7" htmlFor="card_holder">Titular de la tarjeta</label>
                <input
                  type="text"
                  id="card_holder"
                  name="card_holder"
                  style={{ width: '180px' }}
                  value={formData.card_holder}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </form>
            </>
          ) : (
            <p>Cargando...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => camcelTr()}>
            Cancelar
          </Button>
          <Button variant="primary" form="payment-form" type="submit" onClick={handleSubmit}>
          Pagar con Wompi
          </Button>
          
         
        </Modal.Footer>
      </Modal>
    
      <Modal show={summaryModal} onHide={() => setsummaryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Resumen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
            <>
              
              <form id="payment-form" className="form">
              
              
              <div className="form-group">
                <label>Referencia: </label>
                <input
                  className="form-control"
                  value={transaction.reference}  
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Producto: </label>
                <input
                  className="form-control"
                  value={transaction.description}  
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Valor: </label>
                <input
                  className="form-control"
                  value={(transaction.amount/100).toFixed(2)}  
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Estado: </label>
                <input
                  className="form-control"
                  value={status}  
                  readOnly
                />
              </div>
              
            </form>
            
            </>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setsummaryModal(false)}>
            Aceptar
          </Button>
         
        </Modal.Footer>
      </Modal>
      <Modal show={loading} onHide={() => setsummaryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Procesando</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
            <>
              
            {loading ? (
            <div style={{ textAlign: 'center' }}>
              <ClipLoader color={"#000000"} loading={loading} size={50} />
              <p>Cargando datos...</p> 
            </div>
          ) : (
            <div>Contenido cargado</div>  
          )}
            
            </>
          
        </Modal.Body>
        
      </Modal>    
          

    </>
  )
}

export default App

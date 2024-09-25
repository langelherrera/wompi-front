function Guitar({guitar, payWithCreditCard,transaction}){

    const{id,name,image,description,price,stock}=guitar


    
    return (
        <div className="col-md-6 col-lg-4 my-4 row align-items-center">
        <div className="col-4">
            <img className="img-fluid" src={`/img/${image}.jpg`} alt="imagen guitarra" />
        </div>
        <div className="col-8">
            <h3 className="text-black fs-5 fw-bold text-uppercase">{name}</h3>
            <p>{description}</p>
            <p className="fw-black text-primary fs-4">${price.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>stock: {stock}</p>
            
            <button 
                type="button"
                className="btn btn-dark w-100"
             
                onClick={()=>payWithCreditCard(guitar)}
            >Pagar con Tarjeta de credito</button>
             
        </div>
        
    </div>
    )
}

export default Guitar
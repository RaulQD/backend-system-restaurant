

export const generateOrderNumber = (lastOrderNumber) => {
  let prefix = 'FH';
  let newOrderNumber = 'FH-000001'

  if (lastOrderNumber) {
    // Extraer prefijo y número de orden
    const [lastPrefix, lastNumberStr] = lastOrderNumber.split('-');
    const lastNumber = parseFloat(lastNumberStr, 10)

    //incrementar el numero de la orden
    let nextNumber = lastNumber + 1

    //SI EL NÚMERO EXCEDE LOS 6 DIGITOS INCREMENTA EN 1 EL PREFIJO
    if (nextNumber > 999999) {
      nextNumber = 1;
      prefix = `FH${Number(lastPrefix.replace('FH', '') || 1) + 1}`
    } else {
      prefix = lastPrefix
    }
    // Formatear el número de la orden
    newOrderNumber = `${prefix}-${String(nextNumber).padStart(6, '0')}`
  }
  return newOrderNumber;
}

export const determinateOrderStatus = (orderItems, currentStatus) => {

  //VERIFICAR SI ALGUN ITEM DE LA ORDEN ESTA EN ESTADO "EN PREPARACIÓN"
  const someItemsInPreparation = orderItems.some(item => item.status.trim().toUpperCase() === 'EN PREPARACION')
  if(someItemsInPreparation && currentStatus !== 'EN PROCESO'){
    return 'EN PROCESO'
  }
  const allItemsReadyToServer = orderItems.every(item => item.status.trim().toUpperCase() === 'LISTO PARA SERVIR')
  if(allItemsReadyToServer && currentStatus !== 'LISTO PARA SERVIR'){
    return 'LISTO PARA SERVIR'
  }
  const allItemsServed =  orderItems.every(item => item.status.trim().toUpperCase() === 'SERVIDO')
  if(allItemsServed && currentStatus !== 'SERVIDO'){
    return 'LISTO PARA PAGAR'
  }
  const anyItemPending = orderItems.some(item => item.status.trim().toUpperCase() === 'PENDIENTE')
  if(anyItemPending){
    return 'PENDIENTE'
  }
  
  return currentStatus; //MANTENGO EL ESTADO ACTUAL SI NO SE CUMPLE NINGUNA CONDICION


}
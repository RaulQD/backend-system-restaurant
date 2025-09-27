

export const generateOrderNumber = (lastOrderNumber) => {
  let prefix = 'FH';
  let newOrderNumber = 'FH-000001'

  if (lastOrderNumber) {
    
    const [lastPrefix, lastNumberStr] = lastOrderNumber.split('-');
    const lastNumber = parseFloat(lastNumberStr, 10)

    let nextNumber = lastNumber + 1

    if (nextNumber > 999999) {
      nextNumber = 1;
      prefix = `FH${Number(lastPrefix.replace('FH', '') || 1) + 1}`
    } else {
      prefix = lastPrefix
    }
    
    newOrderNumber = `${prefix}-${String(nextNumber).padStart(6, '0')}`
  }
  return newOrderNumber;
}

export const determinateOrderStatus = (orderItems, currentStatus) => {

  const allItemsServed = orderItems.every(item => item.status.trim().toUpperCase() === 'SERVIDO')
  if (allItemsServed && currentStatus !== 'SERVIDO') {
    return 'LISTO PARA PAGAR'
  }
  const allItemsReadyToServer = orderItems.every(item => item.status.trim().toUpperCase() === 'LISTO PARA SERVIR')
  if (allItemsReadyToServer && currentStatus !== 'LISTO PARA SERVIR') {
    return 'LISTO PARA SERVIR'
  }
  //VERIFICAR SI ALGUN ITEM DE LA ORDEN ESTA EN ESTADO "EN PREPARACIÓN"
  const someItemsInPreparation = orderItems.some(item => item.status.trim().toUpperCase() === 'EN PREPARACION')
  if (someItemsInPreparation && currentStatus !== 'EN PROCESO') {
    return 'EN PROCESO'
  }
  const allItemPending = orderItems.every(item => item.status.trim().toUpperCase() === 'PENDIENTE')
  if (allItemPending) {
    return 'PENDIENTE'
  }

  return currentStatus; //MANTENGO EL ESTADO ACTUAL SI NO SE CUMPLE NINGUNA CONDICION


}
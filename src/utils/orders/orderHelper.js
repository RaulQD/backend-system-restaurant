

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
import { useState } from 'react';

export function useSharedState() {
  const [state, setState] = useState({
    conditionMet: false,
    anotherCondition: false,
    dataList: [],
    someValue: 'hola',
    onVisibilityChange: false,
    columnSum: 0,
    SelectedCellValue: null,
    cantidadespor: 0,  
    pesopor: 0,
    bulto: 0,
    bultos: 0,
    pesototal: 0,
    factor: 0,
    TRM: false,
    valorTRM: 0,
    descripcion: "",
    proveedor: "",
    cantidadoc: 0,
    preciouni: 0,
    factunit: 0,
    moneda: "",
    facttotal: 0,
    totalfactura: 0,
    nofactura: "",


  });

  const updateState = (key, value) => {
    setState(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  return { state, updateState };
}


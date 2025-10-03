
export enum TypeData {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export interface Data {
  id?: number;
  datatype: TypeData;
  content: string;
  registrationDate: string;
}

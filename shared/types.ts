// En shared/types.ts
export type Question = {
    id: number;
    content: string;
    quizId: number;
    type: string;
    difficulty: string;
    points: number;
    options: {
      id: number;
      text: string;  // Mapeado desde answers.content
      isCorrect: boolean;
      explanation?: string;
    }[];
  };
//si escribo algo de codigo
//por ejemplo aqui
//y luego quiero hacer 
//npm run dev
//entonces no incluye mis cambios o actualizaciones
//sino que me toca darle primero ctrl+shift+G
//Y darle STAGED
//ENTONCES NO PUEDO TRABAJAR FLUIDAMENTE HACIENDO CAMBIOS Y EJECUTANDO
//ESO PASA CUANDO ESTÁ ESA LINEA VERDE A LA IZQUIERDA
//ANTES SOLO LE DABA CTRL+S Y LISTO IBA GUARDANDO Y AL FINAL SI HACIA COMMIT
//que hago???sdf
//cds

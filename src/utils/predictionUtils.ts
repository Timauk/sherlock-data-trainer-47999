import * as tf from '@tensorflow/tfjs';
import { Player } from './playerUtils';

export const makePrediction = (
  inputData: number[],
  playerModel: tf.LayersModel,
  concursoNumber: number,
  hotNumbers: number[]
): number[] => {
  // Garantir que temos 15 números de entrada
  const paddedInputData = inputData.slice(0, 15).concat(Array(Math.max(0, 15 - inputData.length)).fill(0));
  
  // Criar um tensor 3D com a forma correta [1, 10, 17]
  const recentDraws = Array(10).fill(paddedInputData).map((draw, index) => [
    ...draw,
    concursoNumber / 3184, // Normalizar o número do concurso
    Date.now() / (1000 * 60 * 60 * 24 * 365) // Adicionar timestamp normalizado
  ]);
  
  const input = tf.tensor3d([recentDraws]);
  const predictions = playerModel.predict(input) as tf.Tensor;
  const result = Array.from(predictions.dataSync());
  input.dispose();
  predictions.dispose();
  
  const uniqueNumbers = new Set<number>();
  while (uniqueNumbers.size < 15) {
    if (uniqueNumbers.size < 10) {
      const num = Math.round(result[uniqueNumbers.size] * 24) + 1;
      uniqueNumbers.add(num);
    } else {
      uniqueNumbers.add(hotNumbers[uniqueNumbers.size - 10]);
    }
  }
  
  return Array.from(uniqueNumbers);
};

export const calculateDynamicReward = (matches: number, hotNumbers: number[]): number => {
  const baseReward = matches >= 11 && matches <= 15 ? matches - 10 : 0;
  const hotNumberBonus = matches * hotNumbers.filter(num => matches).length * 0.1;
  return baseReward + hotNumberBonus;
};
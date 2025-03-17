import * as tf from '@tensorflow/tfjs';

export async function createModel() {
  const model = tf.sequential();
  
  model.add(tf.layers.dense({
    inputShape: [64],
    units: 128,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dropout({ rate: 0.3 }));
  
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  model.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid'
  }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

export function preprocessInput(message1: string, message2: string): tf.Tensor {
  // Convert hex strings to byte arrays
  const bytes1 = hexToBytes(message1);
  const bytes2 = hexToBytes(message2);
  
  // Pad or truncate to 32 bytes
  const padded1 = padBytes(bytes1, 32);
  const padded2 = padBytes(bytes2, 32);
  
  // Normalize and concatenate
  const normalized = [...padded1, ...padded2].map(b => b / 255);
  
  return tf.tensor2d([normalized], [1, 64]);
}

function hexToBytes(hex: string): number[] {
  const cleanHex = hex.replace(/\s+/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  return bytes;
}

function padBytes(bytes: number[], length: number): number[] {
  if (bytes.length >= length) {
    return bytes.slice(0, length);
  }
  return [...bytes, ...Array(length - bytes.length).fill(0)];
}
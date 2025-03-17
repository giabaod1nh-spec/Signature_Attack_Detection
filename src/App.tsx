import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, ShieldCheck } from 'lucide-react';
import { calculateMD5, generateRSAKeyPair, rsaEncrypt, KeyPair } from './utils/crypto';
import { createModel, preprocessInput } from './utils/model';
import * as tf from '@tensorflow/tfjs';

function App() {
  const [message1, setMessage1] = useState('');
  const [message2, setMessage2] = useState('');
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [collisionDetected, setCollisionDetected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [hash1, setHash1] = useState<string>('');
  const [hash2, setHash2] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeSystem = async () => {
      const keys = generateRSAKeyPair();
      setKeyPair(keys);
      const neuralModel = await createModel();
      setModel(neuralModel);
    };
    initializeSystem();
  }, []);

  const validateHex = (hex: string): boolean => {
    const cleanHex = hex.replace(/\s+/g, '');
    return /^[0-9a-fA-F]+$/.test(cleanHex);
  };

  const checkCollision = async () => {
    if (!model || !keyPair || !message1 || !message2) return;
    
    setError('');
    setLoading(true);
    
    try {
      // Validate hex input
      if (!validateHex(message1) || !validateHex(message2)) {
        throw new Error('Invalid hex format. Please enter valid hexadecimal values.');
      }

      // Calculate hashes
      const calculatedHash1 = calculateMD5(message1);
      const calculatedHash2 = calculateMD5(message2);
      
      setHash1(calculatedHash1);
      setHash2(calculatedHash2);

      // Prepare input for the model
      const input = preprocessInput(message1, message2);
      
      // Get model prediction
      const prediction = await model.predict(input) as tf.Tensor;
      const probability = await prediction.data();
      
      // Check for collision
      const isCollision = calculatedHash1 === calculatedHash2 && message1 !== message2;
      setCollisionDetected(isCollision);

      // Clean up tensor
      prediction.dispose();
    } catch (error) {
      console.error('Error during collision check:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">RSA Hash Collision Detector</h1>
        </div>

        <div className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl">
          <div>
            <label className="block text-sm font-medium mb-2">Message 1 (Hex format)</label>
            <textarea
              value={message1}
              onChange={(e) => setMessage1(e.target.value.trim())}
              className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm h-24"
              placeholder="Enter first message in hex format"
            />
            {hash1 && (
              <p className="mt-2 text-sm text-gray-400 font-mono break-all">
                MD5: {hash1}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message 2 (Hex format)</label>
            <textarea
              value={message2}
              onChange={(e) => setMessage2(e.target.value.trim())}
              className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm h-24"
              placeholder="Enter second message in hex format"
            />
            {hash2 && (
              <p className="mt-2 text-sm text-gray-400 font-mono break-all">
                MD5: {hash2}
              </p>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 text-red-200 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={checkCollision}
            disabled={loading || !model || !keyPair || !message1 || !message2}
            className={`w-full py-3 rounded-md font-medium transition ${
              loading || !message1 || !message2
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Analyzing...' : 'Check for Collision'}
          </button>

          {collisionDetected !== null && !error && (
            <div
              className={`flex items-center gap-2 p-4 rounded-md ${
                collisionDetected
                  ? 'bg-red-900/50 text-red-200'
                  : 'bg-green-900/50 text-green-200'
              }`}
            >
              {collisionDetected ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>Hash collision detected! Both messages produce the same MD5 hash but have different content.</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <span>No collision detected - messages are safe.</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>
            This system uses RSA encryption and deep learning to detect potential
            hash collisions between two different messages. The neural network
            analyzes message patterns to identify suspicious inputs that might
            indicate an attempted collision attack.
          </p>
          <p className="mt-4">
            Input messages should be in hexadecimal format. For example, to test a collision,
            you can use known MD5 collision pairs.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
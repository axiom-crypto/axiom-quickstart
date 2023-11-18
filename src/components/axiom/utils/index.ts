export const convertToBytes32 = (inputArray: Uint8Array): string[] => {
    let result: string[] = [];
    for (let i = 0; i < inputArray.length; i += 32) {
        let slice = inputArray.slice(i, i + 32);
        let hex = '0x' + Buffer.from(slice).toString('hex').padStart(64, '0');
        result.push(hex);
    }
    return result;
}

export const convertToBytes = (inputArray: Uint8Array): string => {
    let hex = Buffer.from(inputArray).toString('hex');
    return hex;
}

export const getRandom32Bytes = (): `0x${string}` => {
    let randomBytes = "";
  
    for (let i = 0; i < 64; i++) { // Each byte has two hex characters
      const randomHex = Math.floor(Math.random() * 16).toString(16);
      randomBytes += randomHex;
    }
  
    return `0x${randomBytes}`;
  }
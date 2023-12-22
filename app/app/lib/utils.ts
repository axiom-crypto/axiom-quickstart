const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

export const shortenAddress = (address: string) => {
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const numberToHex = (num: number) => {
  return `0x${num.toString(16)}`;
}

export const classes = (...classNames: (string | undefined | boolean)[]) =>
  classNames.filter((c) => !!c).join(' ');

export const forwardSearchParams = (searchParams: {[key: string]: string | string[] | undefined}): string => {
  // searchParams { address: '0xB392448932F6ef430555631f765Df0dfaE34efF3' }
  // -> "address=0xB392448932F6ef430555631f765Df0dfaE34efF3"
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, Array.isArray(value) ? value.join(',') : value);
    }
  });
  return params.toString();
}

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

export const bytes32 = (input: string): string => {
  const val = BigInt(input);
  return '0x' + val.toString(16).padStart(64, '0').toLowerCase();
}
import React, { useState } from 'react';

interface InteractiveCodeDisplayProps {
    solutionCode: string;
}

const InteractiveCodeDisplay: React.FC<InteractiveCodeDisplayProps> = ({ solutionCode }) => {
    const [showSolution, setShowSolution] = useState(false);

  return (
    <div>
      <button onClick={() => setShowSolution(!showSolution)}>
        Click here for the solution
      </button>
      {showSolution && (
        <div style={{ marginTop: '10px', border: '1px solid #ddd', padding: '10px', whiteSpace: 'pre-wrap' }}>
          <code>
            {solutionCode}
          </code>
        </div>
      )}
    </div>
  );
}

export default InteractiveCodeDisplay;

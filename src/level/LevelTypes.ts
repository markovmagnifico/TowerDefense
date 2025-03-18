export interface PathNode {
  x: number;
  z: number;
  directions: number[];
  type?: string;
  id?: string;
}

export interface GridDimensions {
  width: number;
  height: number;
}

export interface LevelData {
  metadata: {
    id: string;
    name: string;
    description: string;
  };
  dimensions: GridDimensions;
  terrain: {
    heightmap: number[][];
    ground: {
      pattern: string;
      colors: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
    };
  };
  paths: {
    color: string;
    nodes: PathNode[];
  };
}

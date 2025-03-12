export interface PathNode {
  x: number;
  y: number;
  directions: number[];
  type?: string;
  id?: string;
}

export interface LevelData {
  metadata: {
    id: string;
    name: string;
    description: string;
  };
  dimensions: {
    width: number;
    height: number;
  };
  terrain: {
    heightmap: number[][];
    ground: {
      pattern: string;
      colors: {
        primary: string;
        secondary: string;
      };
    };
  };
  paths: {
    color: string;
    nodes: PathNode[];
  };
}

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

export interface WaveSpawn {
  path_id: string;
  enemies: Array<{
    type: string;
    count: number;
  }>;
}

export interface WaveData {
  id: string;
  name: string;
  spawns: WaveSpawn[];
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
  waves: WaveData[];
}

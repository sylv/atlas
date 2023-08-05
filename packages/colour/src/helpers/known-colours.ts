import hexToRgb from 'hex-rgb';

export interface Colour {
  name: string;
  hex: string;
  decimal: number;
  light: boolean;
  rgb: {
    red: number;
    blue: number;
    green: number;
  };
}

export const KNOWN_COLOURS: Colour[] = [
  {
    name: 'Black',
    hex: '#000000',
  },
  {
    name: 'Dark Mode',
    hex: '#36393f',
  },
  {
    name: 'White',
    hex: '#FFFFFF',
  },
  {
    name: 'Red',
    hex: '#ED4245',
  },
  {
    name: 'Pink',
    hex: '#EB459E',
  },
  {
    name: 'Fuchsia',
    hex: '#EB459E',
  },
  {
    name: 'Purple',
    hex: '#9C27B0',
  },
  {
    name: 'Blurple',
    hex: '#5865F2',
  },
  {
    name: 'Blurple Classic',
    hex: '#7289DA',
  },
  {
    name: 'Deep Purple',
    hex: '#673AB7',
  },
  {
    name: 'Indigo',
    hex: '#3F51B5',
  },
  {
    name: 'Blue',
    hex: '#2196F3',
  },
  {
    name: 'Light Blue',
    hex: '#03A9F4',
  },
  {
    name: 'Cyan',
    hex: '#00BCD4',
  },
  {
    name: 'Teal',
    hex: '#009688',
  },
  {
    name: 'Green',
    hex: '#57F287',
  },
  {
    name: 'Light Green',
    hex: '#8BC34A',
  },
  {
    name: 'Lime',
    hex: '#CDDC39',
  },
  {
    name: 'Yellow',
    hex: '#FEE75C',
  },
  {
    name: 'Amber',
    hex: '#FFC107',
  },
  {
    name: 'Orange',
    hex: '#FF9800',
  },
  {
    name: 'Deep Orange',
    hex: '#FF5722',
  },
  {
    name: 'Brown',
    hex: '#795548',
  },
  {
    name: 'Grey',
    hex: '#9E9E9E',
  },
  {
    name: 'Blue Grey',
    hex: '#607D8B',
  },
  {
    name: 'Role Default',
    hex: '#4f545c',
  },
  {
    name: 'Magenta',
    hex: '#E91E63',
  },
].map((colour) => {
  const rgb = hexToRgb(colour.hex);
  const brightness = (rgb.red * 299 + rgb.green * 587 + rgb.blue * 114) / 1000;
  const light = brightness > 125;
  return {
    ...colour,
    rgb: hexToRgb(colour.hex),
    decimal: Number.parseInt(colour.hex.replace('#', ''), 16),
    light: light,
  };
});

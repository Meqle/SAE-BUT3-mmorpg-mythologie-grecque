// taille et type d'ecran : sert a adapter l'interface au telephone
import { useEffect, useState } from 'react';

export interface Screen {
  compact: boolean; // petit ecran (telephone)
  touch: boolean; // ecran tactile : on affiche les commandes a l'ecran
  portrait: boolean;
}

function read(): Screen {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    compact: w < 760 || h < 480,
    touch: window.matchMedia('(pointer: coarse)').matches,
    portrait: h > w
  };
}

export function useScreen(): Screen {
  const [screen, setScreen] = useState<Screen>(read);

  useEffect(() => {
    const update = () => setScreen(read());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return screen;
}

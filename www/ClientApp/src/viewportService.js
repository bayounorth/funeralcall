import React, {createContext, useState, useContext} from 'react';

const ViewportContext = createContext( {} );

export const ViewportProvider = ( { children } ) => 
{
    const [width, setWidth]     = useState( window.innerWidth );
    const [height, setHeight]   = useState( window.innerHeight );
    
    const handleWindowResize = () => 
    {
        setWidth( window.innerWidth );
        setHeight( window.innerHeight );
    }

    React.useEffect(() => {
        
        window.addEventListener( "resize", handleWindowResize );
        
        return () => window.removeEventListener( "resize", handleWindowResize );
        
    }, [] );
    
    return (
        <ViewportContext.Provider value={ { width, height } }>
            { children }
        </ViewportContext.Provider>
    );
};

export const useViewport = () =>
{
    const { width, height } = useContext( ViewportContext );
    
    return { width, height };
}
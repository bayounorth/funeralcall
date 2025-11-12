import React, {useEffect} from 'react';
import FCLabel from './fcLabel';
import { BACKGROUND_COLOR } from '../constants';
import { View } from 'react-native';
import {IndexPath, Select, SelectItem} from '@ui-kitten/components';

const FormFieldSelect = props =>
{
    const [selectedIndex, setSelectedIndex] = React.useState( new IndexPath( 0 ) );

    useEffect( () =>
	{
	    if( !props.options || !props.value ){ return; }

	    for( let i = 0; i < props.options.length; i++ )
        {
            const option = props.options[i];

            if( option.id === props.value )
            {
                setSelectedIndex( new IndexPath( i ) );
                break;
            }
        }

	}, [ props.options, props.value ] );

    const onSelect = ( index ) =>
    {
        setSelectedIndex( index );

        props.onSelect && props.onSelect( props.options[index.row].id );
    };

    const renderItems = () =>
    {
        let items = [];

        if( !props.options ){ return items; }

        for( let i = 0; i < props.options.length; i++ )
        {
            const option = props.options[i];

            items.push( <SelectItem key={ i } title={ option.name }/> );
        }

        return items;
    };

	return (
		<View style={ { margin: 5, marginStart: 10, marginEnd: 10, flex: 1 } }>
			<FCLabel label={ props.label } labelStyle={ { fontFamily: 'OpenSans-Bold', fontSize: 18, color: BACKGROUND_COLOR, marginBottom: 4, marginStart: 2 } }/>
            <Select selectedIndex={ selectedIndex } value={ props.options[selectedIndex.row].name } onSelect={ onSelect }>
                { renderItems() }
            </Select>
		</View>
	);
};

export default FormFieldSelect;

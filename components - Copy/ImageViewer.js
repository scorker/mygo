import React, { useState } from 'react';
import { View } from 'react-native';
import ImageView from "react-native-image-viewing";

export default function ImageViewer(props) {
    const [imageIndex, setImageIndex] = useState(props.index);
    const images = props.images.map((f) => { return { uri: f }});
    if(props.index !== imageIndex) {
        setImageIndex(props.index);
    }
    return (
        <View>
            <ImageView
                images={images}
                imageIndex={imageIndex}
                onImageIndexChange={(e) => setImageIndex(e)}
                visible={props.visible}
                onRequestClose={() => props.toggleVisible()}
            />
        </View>
    )
}
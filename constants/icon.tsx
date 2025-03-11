import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faCompass, faUser } from '@fortawesome/free-solid-svg-icons';

// free-solid-svg-icons
// free-regular-svg-icons
// free-brands-svg-icons
// bu kütüphaneleri yükleyip daha sonra gerekli icon ı import edip kullanıyoruz.


export const icon = {
          index: (props: any) => <FontAwesomeIcon size={18} icon={faHome} color={props.color} />,
          explore: (props: any) => <FontAwesomeIcon size={18} icon={faCompass} color={props.color} />,
          profile: (props: any) => <FontAwesomeIcon size={18} icon={faUser} color={props.color} />
}
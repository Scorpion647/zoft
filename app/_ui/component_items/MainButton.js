
import { Button, HStack } from '@chakra-ui/react';

const MainButton = ({ onClick, text, icon, backgroundColor = '#F1D803', disabled = false, showRightBox, isScreenSmall, MenuL }) => (
  <Button 
    onClick={onClick} 
    display="block" 
    whiteSpace='normal' 
    backgroundColor={disabled ? 'gray.300' : backgroundColor} 
    transition="width 0.3s ease-in-out"
    isDisabled={disabled}
  >
    <HStack justify='center'>
      {((!showRightBox && !isScreenSmall) && !MenuL) && (
        <p style={{ width: '95%' }} className="text-black font-semibold">{text}</p>
      )}
      {icon}
    </HStack>
  </Button>
);

export default MainButton;
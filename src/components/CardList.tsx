import { SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { Card } from './Card';
import { ModalViewImage } from './Modal/ViewImage';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface CardsProps {
  cards: Card[];
}

export function CardList({ cards }: CardsProps): JSX.Element {
  // TODO MODAL USEDISCLOSURE
  const { onOpen, isOpen, onClose } = useDisclosure();

  // TODO SELECTED IMAGE URL STATE
  const [imageUrl, setImageUrl] = useState('');

  // TODO FUNCTION HANDLE VIEW IMAGE
  const handleViewImage = (url : string) => {
    onOpen();
    setImageUrl(url)
  }

  return (
    <>
      <SimpleGrid columns={[1, 2 , 3]} spacing='40px'>
        {cards.map(card => (
          <Card data={card}
          viewImage={handleViewImage}
          key={card.id}
          />
        ))
        }
      </SimpleGrid>

      <ModalViewImage
        isOpen={isOpen}
        imgUrl={imageUrl}
        onClose={onClose}
      />
    </>
  );
}

import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

const typeRegex = /(?:([^:/?#]+):)?(?:([^/?#]*))?([^?#](?:jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/g;

interface FormAddImageProps {
  closeModal: () => void;
}

interface CreateImageData {
  url: string;
  title: string;
  description: string;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: "Arquivo obrigatório",
      validate: {
        lessThan10MB: image => image[0].size < 10000000 || 'O arquivo deve ser menor que 10MB',
        acceptedFormats: image => typeRegex.test(image[0].type) || 'Somente são aceitos arquivos PNG, JPEG e GIF'
      }
    },
    title: {
      required: "Título obrigatório",
      minLength: {
        value: 2,
        message: 'Mínimo de 2 caracteres'
      },
      maxLength: {
        value: 20,
        message: 'Máximo de 20 caracteres'
      },  
    },
    description: {
      required: "Descrição obrigatória",    
      maxLength: {
        value: 65,
        message: 'Máximo de 65 caracteres',
      },     
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(async (image: CreateImageData) => {
    const response  = await api.post('/api/images', {
      ...image,
      url: imageUrl
    })


    return response
}, {
    onSuccess: () => {
        queryClient.invalidateQueries('images')
    }
})

  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    trigger,
  } = useForm();
  const { errors } = formState;

  const onSubmit = async (data: CreateImageData): Promise<void> => {
    try {

      if(!imageUrl)  {
        toast({
          title: 'Imagem não adicionada',
          description: "É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.",
          status: 'info',
          duration: 9000,
          isClosable: true,
        })

        return;
      }

      await mutation.mutateAsync(data);
      
      toast({
        title: 'Imagem cadastrada',
        description: "Sua imagem foi cadastrada com sucesso.",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
    } catch {
      toast({
        title: 'Falha no cadastro',
        description: "Ocorreu um erro ao tentar cadastrar a sua imagem.",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    } finally {
      setImageUrl('');
      setLocalImageUrl('');
      reset();
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          name='image'
          {...register('image', formValidations.image)}
          error={errors.image}
        />

        <TextInput
          placeholder="Título da imagem..."
          name='title'
          {...register('title', formValidations.title)}
          error={errors.title}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          name='description'
          {...register('description', formValidations.description)}
          error={errors.description}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}

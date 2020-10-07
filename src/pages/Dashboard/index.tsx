import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { FiChevronRight, FiTrash } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import logoImg from '../../assets/logo.svg';
import api from '../../services/api';

import {
  Title,
  Form,
  Repositories,
  Repository,
  DeleteButton,
  Error,
} from './styles';

interface Repo {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [newRepo, setNewRepo] = useState('');
  const [inputError, setInputError] = useState('');
  const [repositories, setRepositories] = useState<Repo[]>(() => {
    const storedRepositories = localStorage.getItem(
      '@GithubExplorer:repositories',
    );

    if (storedRepositories) {
      return JSON.parse(storedRepositories);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      '@GithubExplorer:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  const handleAddRepository = useCallback(
    async (event: FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();

      if (!newRepo) {
        setInputError('Insert repository author/name');
        return;
      }

      const findRepositoryIndex = repositories.findIndex(
        repository =>
          repository.full_name.toLowerCase() === newRepo.toLowerCase(),
      );

      if (findRepositoryIndex > -1) {
        setInputError('Repository already on the list');
        return;
      }

      try {
        const response = await api.get<Repo>(`repos/${newRepo}`);

        const repository = response.data;

        setRepositories([...repositories, repository]);
        setNewRepo('');
        setInputError('');
      } catch {
        setInputError('Error on repository search');
      }
    },
    [newRepo, repositories],
  );

  const handleRemoveRepository = useCallback(
    (repositoryName: string) => {
      const newRepositories = repositories.filter(
        repository => repository.full_name !== repositoryName,
      );

      setRepositories(newRepositories);
    },
    [repositories],
  );

  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>Explore Github repositories</Title>

      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          value={newRepo}
          onChange={e => setNewRepo(e.target.value)}
          placeholder="Enter the name of the repository"
        />
        <button type="submit">Search</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repositories>
        {repositories.map(repository => (
          <Repository key={repository.full_name}>
            <DeleteButton
              type="button"
              onClick={() => handleRemoveRepository(repository.full_name)}
            >
              <FiTrash size={20} />
            </DeleteButton>

            <Link to={`/repositories/${repository.full_name}`}>
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
              />

              <div>
                <strong>{repository.full_name}</strong>
                <p>{repository.description}</p>
              </div>

              <FiChevronRight size={20} />
            </Link>
          </Repository>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;

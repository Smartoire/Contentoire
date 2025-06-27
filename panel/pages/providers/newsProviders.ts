import CurrentsApi from './news/CurrentsApi';
import NewsApiOrg from './news/NewsApiOrg';
import NewsDataIo from './news/NewsDataIo';
import WorldNewsApi from './news/WorldNewsApi';

export const newsProviders = [
  {
    id: CurrentsApi.id,
    logo: CurrentsApi.logo,
    title: CurrentsApi.provider,
    instance: new CurrentsApi(),
  },
  {
    id: NewsApiOrg.id,
    logo: NewsApiOrg.logo,
    title: NewsApiOrg.provider,
    instance: new NewsApiOrg(),
  },
  {
    id: NewsDataIo.id,
    logo: NewsDataIo.logo,
    title: NewsDataIo.provider,
    instance: new NewsDataIo(),
  },
  {
    id: WorldNewsApi.id,
    logo: WorldNewsApi.logo,
    title: WorldNewsApi.provider,
    instance: new WorldNewsApi(),
  },
];

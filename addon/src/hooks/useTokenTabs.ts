import { useEffect, useMemo, useState } from 'react';
import { useStorageState } from 'react-storage-hooks';

import { Category } from '../types/category.types';
import { Config } from '../types/config.types';

export function useTokenTabs(config?: Config) {
  const [tokenFiles, setTokenFiles] = useState<{
    [type: string]: { categories: Category[]; injectionStyles: string };
  }>();

  const [cssCategories, setCssCategories] = useState<Category[]>([]);
  const [lessCategories, setLessCategories] = useState<Category[]>([]);
  const [scssCategories, setScssCategories] = useState<Category[]>([]);
  const [svgIconCategories, setSvgIconCategories] = useState<Category[]>([]);

  const [activeCategory, setActiveCategory] = useState<string>();
  const [cardView, setCardView] = useStorageState(
    localStorage,
    'storybook-design-token-addon-card',
    false
  );

  const [styleInjections, setStyleInjections] = useState('');

  const tabs = useMemo(() => {
    const categories = [
      ...cssCategories,
      ...lessCategories,
      ...scssCategories,
      ...svgIconCategories
    ].filter(
      (category) => category !== undefined && category?.tokens.length > 0
    );

    const categoryNames = Array.from(
      new Set(categories.map((category) => category?.name))
    );

    return categoryNames.map((name) => ({
      label: name,
      categories: categories.filter(
        (category) => category?.name === name
      ) as Category[]
    }));
  }, [cssCategories, lessCategories, scssCategories, svgIconCategories]);

  useEffect(() => {
    async function fetchTokenFiles() {
      const designTokenSorce = await (
        await fetch('./design-tokens.source.json')
      ).text();

      setTokenFiles(JSON.parse(designTokenSorce));
    }

    fetchTokenFiles();
  }, []);

  useEffect(() => {
    const cssTokens = tokenFiles?.cssTokens;
    const lessTokens = tokenFiles?.lessTokens;
    const scssTokens = tokenFiles?.scssTokens;
    const svgTokens = tokenFiles?.svgTokens;

    setStyleInjections(config?.styleInjection || '');

    if (cssTokens) {
      setCssCategories(cssTokens.categories);

      if (!config?.defaultTab && cssTokens.categories.length > 0) {
        setActiveCategory(
          (activeCategory) => activeCategory || cssTokens.categories[0].name
        );
      }

      setStyleInjections((current) => current + cssTokens.injectionStyles);
    }

    if (lessTokens) {
      setLessCategories(lessTokens.categories);

      if (!config?.defaultTab && lessTokens.categories.length > 0) {
        setActiveCategory(
          (activeCategory) => activeCategory || lessTokens.categories[0].name
        );
      }

      setStyleInjections((current) => current + lessTokens.injectionStyles);
    }

    if (scssTokens) {
      setScssCategories(scssTokens.categories);

      if (!config?.defaultTab && scssTokens.categories.length > 0) {
        setActiveCategory(
          (activeCategory) => activeCategory || scssTokens.categories[0].name
        );
      }

      setStyleInjections((current) => current + scssTokens.injectionStyles);
    }

    if (svgTokens) {
      setSvgIconCategories(svgTokens.categories);
    }
  }, [config, tokenFiles]);

  useEffect(() => {
    if (config?.defaultTab && !activeCategory) {
      setActiveCategory(config.defaultTab);
    }
  }, [activeCategory, config]);

  return {
    activeCategory,
    cardView,
    setActiveCategory,
    setCardView,
    styleInjections,
    tabs
  };
}

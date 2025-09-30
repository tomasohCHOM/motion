import { ErrorThrowerOptions } from '@clerk/shared/error';
export { M as MultisessionAppSupport, u as useDerivedAuth } from './useAuth-DEP6m3So.js';
import { RoutingOptions } from '@clerk/types';
export { buildClerkJsScriptAttributes, clerkJsScriptUrl, setClerkJsLoadingErrorPackageName } from '@clerk/shared/loadClerkJsScript';
import 'react';
import './types-BAMVj4gL.js';

/**
 * Overrides options of the internal errorThrower (eg setting packageName prefix).
 *
 * @internal
 */
declare function setErrorThrowerOptions(options: ErrorThrowerOptions): void;

declare function useRoutingProps<T extends RoutingOptions>(componentName: string, props: T, routingOptions?: RoutingOptions): T;

export { setErrorThrowerOptions, useRoutingProps };

import { getSupabaseClient } from './supabase';

export interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  accountId: string;
}

export interface FirewallRule {
  id: string;
  expression: string;
  action: 'block' | 'challenge' | 'allow';
  description: string;
  enabled: boolean;
}

export interface IPList {
  id: string;
  name: string;
  description: string;
  kind: 'ip' | 'redirect';
  num_items: number;
  num_referencing_filters: number;
  created_on: string;
  modified_on: string;
}

/**
 * Get Cloudflare configuration from environment
 */
export function getCloudflareConfig(): CloudflareConfig | null {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !zoneId || !accountId) {
    console.warn('Cloudflare configuration incomplete. Missing required environment variables.');
    return null;
  }

  return { apiToken, zoneId, accountId };
}

/**
 * Create a firewall rule to block an IP address
 */
export async function createBlockingRule(ip: string, reason: string): Promise<string | null> {
  const config = getCloudflareConfig();
  if (!config) return null;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/firewall/rules`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'block',
          expression: `(ip.src eq ${ip})`,
          description: `Block IP ${ip} - ${reason}`,
          enabled: true,
        }),
      }
    );

    const data = await response.json();
    
    if (data.success) {
      console.log(`Successfully created blocking rule for IP ${ip}`);
      return data.result.id;
    } else {
      console.error('Failed to create blocking rule:', data.errors);
      return null;
    }
  } catch (error) {
    console.error('Error creating blocking rule:', error);
    return null;
  }
}

/**
 * Delete a firewall rule
 */
export async function deleteBlockingRule(ruleId: string): Promise<boolean> {
  const config = getCloudflareConfig();
  if (!config) return false;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/firewall/rules/${ruleId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
        },
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting blocking rule:', error);
    return false;
  }
}

/**
 * List all firewall rules
 */
export async function listFirewallRules(): Promise<FirewallRule[]> {
  const config = getCloudflareConfig();
  if (!config) return [];

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/firewall/rules`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.success) {
      return data.result.map((rule: Record<string, unknown>) => ({
        id: rule.id,
        expression: rule.expression,
        action: rule.action,
        description: rule.description,
        enabled: rule.enabled,
      }));
    } else {
      console.error('Failed to list firewall rules:', data.errors);
      return [];
    }
  } catch (error) {
    console.error('Error listing firewall rules:', error);
    return [];
  }
}

/**
 * Create an IP list for bulk blocking
 */
export async function createIPList(name: string, description: string): Promise<string | null> {
  const config = getCloudflareConfig();
  if (!config) return null;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/rules/lists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          kind: 'ip',
        }),
      }
    );

    const data = await response.json();
    
    if (data.success) {
      console.log(`Successfully created IP list: ${name}`);
      return data.result.id;
    } else {
      console.error('Failed to create IP list:', data.errors);
      return null;
    }
  } catch (error) {
    console.error('Error creating IP list:', error);
    return null;
  }
}

/**
 * Add IP to a list
 */
export async function addIPToList(listId: string, ip: string): Promise<boolean> {
  const config = getCloudflareConfig();
  if (!config) return false;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/rules/lists/${listId}/items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip,
        }),
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error adding IP to list:', error);
    return false;
  }
}

/**
 * Remove IP from a list
 */
export async function removeIPFromList(listId: string, itemId: string): Promise<boolean> {
  const config = getCloudflareConfig();
  if (!config) return false;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/rules/lists/${listId}/items/${itemId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
        },
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error removing IP from list:', error);
    return false;
  }
}

/**
 * Get IP lists
 */
export async function getIPLists(): Promise<IPList[]> {
  const config = getCloudflareConfig();
  if (!config) return [];

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/rules/lists`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.success) {
      return data.result;
    } else {
      console.error('Failed to get IP lists:', data.errors);
      return [];
    }
  } catch (error) {
    console.error('Error getting IP lists:', error);
    return [];
  }
}

/**
 * Block IP using Cloudflare and store in database
 */
export async function blockIPWithCloudflare(ip: string, reason: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // Create Cloudflare firewall rule
    const ruleId = await createBlockingRule(ip, reason);
    
    // Store in database
    const { error } = await supabase
      .from('blocked_ips')
      .insert({
        ip_address: ip,
        reason,
        blocked_by: 'system',
        cloudflare_rule_id: ruleId,
        is_active: true,
      });

    if (error) {
      console.error('Error storing blocked IP in database:', error);
      return false;
    }

    console.log(`Successfully blocked IP ${ip} with Cloudflare rule ${ruleId}`);
    return true;
  } catch (error) {
    console.error('Error blocking IP with Cloudflare:', error);
    return false;
  }
}

/**
 * Unblock IP by removing Cloudflare rule and updating database
 */
export async function unblockIPWithCloudflare(ip: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // Get the blocked IP record
    const { data: blockedIP, error: fetchError } = await supabase
      .from('blocked_ips')
      .select('cloudflare_rule_id')
      .eq('ip_address', ip)
      .eq('is_active', true)
      .single();

    if (fetchError || !blockedIP) {
      console.error('Error fetching blocked IP record:', fetchError);
      return false;
    }

    // Delete Cloudflare rule if it exists
    if (blockedIP.cloudflare_rule_id) {
      const deleteSuccess = await deleteBlockingRule(blockedIP.cloudflare_rule_id);
      if (!deleteSuccess) {
        console.warn(`Failed to delete Cloudflare rule ${blockedIP.cloudflare_rule_id}`);
      }
    }

    // Update database record
    const { error: updateError } = await supabase
      .from('blocked_ips')
      .update({
        is_active: false,
        unblocked_at: new Date().toISOString(),
      })
      .eq('ip_address', ip)
      .eq('is_active', true);

    if (updateError) {
      console.error('Error updating blocked IP record:', updateError);
      return false;
    }

    console.log(`Successfully unblocked IP ${ip}`);
    return true;
  } catch (error) {
    console.error('Error unblocking IP with Cloudflare:', error);
    return false;
  }
}

/**
 * Get Cloudflare analytics for blocked IPs
 */
export async function getCloudflareAnalytics(startDate: string, endDate: string) {
  const config = getCloudflareConfig();
  if (!config) return null;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/analytics/dashboard?since=${startDate}&until=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
        },
      }
    );

    const data = await response.json();
    return data.success ? data.result : null;
  } catch (error) {
    console.error('Error getting Cloudflare analytics:', error);
    return null;
  }
}
